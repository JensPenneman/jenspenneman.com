import type { NextRequest } from "next/server";

/** First-party CSP violation collector, named by `report-to csp` and the
 * `Reporting-Endpoints` header that proxy.ts sends with every document.
 *
 * Nothing is stored and nothing is forwarded: each violation becomes one line
 * on stdout, which Vercel keeps as a function log. No third party ever sees a
 * reader's URL, user agent or IP.
 */

/* A violation report is a few hundred bytes. Anything past this is not one,
 * and is refused without being buffered. */
const MAX_BYTES = 64 * 1024;

/* The Reporting API posts a batch as `application/reports+json`; the legacy
 * `report-uri` form posts one `{"csp-report": {...}}` as
 * `application/csp-report`. Both are accepted so the endpoint keeps working
 * if either spelling is ever added to the policy. */
const REPORT_TYPES = ["application/reports+json", "application/csp-report", "application/json"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** First present value among `keys`, as a string; "-" when the report omits
 * them all. The Reporting API and the legacy form name the same fields
 * differently (`blockedURL` vs `blocked-uri`), hence the aliases. */
function field(report: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = report[key];
    if (typeof value === "string" && value !== "") return value;
    if (typeof value === "number") return String(value);
  }
  return "-";
}

/** The fields every shape of report names one of; an object with none of
 * them is not a violation and is not logged. */
const VIOLATION_FIELDS = [
  "effectiveDirective",
  "effective-directive",
  "violated-directive",
  "blockedURL",
  "blocked-uri",
];

/** The violation inside one posted entry. Three shapes are in the wild: the
 * Reporting API's `{type, url, body}` envelope, the legacy report-uri
 * `{"csp-report": {...}}`, and WebKit's report-uri POST, which is a single
 * unbatched envelope rather than an array. */
function violationIn(entry: unknown): Record<string, unknown>[] {
  if (!isRecord(entry)) return [];
  const inner = entry["csp-report"] ?? entry["body"];
  const violation = isRecord(inner) ? inner : entry;
  return VIOLATION_FIELDS.some((key) => key in violation) ? [violation] : [];
}

function violations(payload: unknown): Record<string, unknown>[] {
  return Array.isArray(payload) ? payload.flatMap(violationIn) : violationIn(payload);
}

/** Reads at most MAX_BYTES; null once the body goes over, so an oversized --
 * or chunked, length-less -- POST is never buffered whole. */
async function readCapped(body: ReadableStream<Uint8Array> | null): Promise<string | null> {
  if (!body) return "";
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    size += chunk.value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return text + decoder.decode();
}

export async function POST(request: NextRequest): Promise<Response> {
  const type = (request.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase();
  if (type === undefined || !REPORT_TYPES.includes(type)) {
    return new Response(null, { status: 415 });
  }
  const declared = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    return new Response(null, { status: 413 });
  }
  const text = await readCapped(request.body);
  if (text === null) return new Response(null, { status: 413 });

  let payload: unknown;
  try {
    payload = JSON.parse(text || "null");
  } catch {
    return new Response(null, { status: 400 });
  }
  for (const violation of violations(payload)) {
    /* One compact line per violation: the directive, what it blocked, where. */
    // biome-ignore lint/suspicious/noConsole: stdout is the sink -- Vercel keeps function logs, and this endpoint deliberately stores nothing
    console.warn(
      `[csp] ${field(violation, "effectiveDirective", "effective-directive", "violated-directive")}` +
        ` blocked ${field(violation, "blockedURL", "blocked-uri")}` +
        ` on ${field(violation, "documentURL", "document-uri")}` +
        ` (${field(violation, "sourceFile", "source-file")}:${field(violation, "lineNumber", "line-number")})` +
        ` disposition=${field(violation, "disposition")}`,
    );
  }
  /* Reports are fire-and-forget; there is nothing to say back. */
  return new Response(null, { status: 204 });
}
