/* Static server that serves out/ the way Vercel would: response headers from
 * vercel.json applied per `source` pattern, strong ETags with 304s, brotli /
 * gzip, 308 redirects for trailing slashes (trailingSlash: false), and
 * 404.html with a real 404 status. Used for local preview and the E2E suite.
 * Usage: node scripts/serve.mjs [port]   (default 4173) */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "out");
const PORT = Number(process.argv[2] ?? 4173);

/**
 * @typedef {{ key: string, value: string }} Header
 * @typedef {{ source: string, headers: Header[] }} HeaderRule
 * @typedef {{ headers?: HeaderRule[] }} VercelConfig
 */

/** @type {VercelConfig} */
const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));

/**
 * Vercel `source` (path-to-regexp subset: literal segments + `(regex)` groups) -> RegExp
 * @param {string} source
 */
function toRegExp(source) {
  const pattern = source
    .split(/(\([^)]*\))/)
    .map((part, i) => (i % 2 ? part : part.replace(/[.*+?^${}|[\]\\]/g, "\\$&")))
    .join("");
  return new RegExp(`^${pattern}$`);
}

const headerRules = (vercel.headers ?? []).map((rule) => ({
  test: toRegExp(rule.source),
  headers: rule.headers,
}));

/** @type {Record<string, string>} */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};
const COMPRESSIBLE = new Set([
  ".html",
  ".css",
  ".js",
  ".json",
  ".webmanifest",
  ".xml",
  ".txt",
  ".svg",
]);

/** @param {string} pathname */
function resolve(pathname) {
  const clean = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const base = join(OUT, clean);
  const candidates = [base, join(base, "index.html"), `${base}.html`];
  return candidates.find((p) => existsSync(p) && statSync(p).isFile());
}

/** @param {string} accept */
function pickEncoding(accept) {
  if (/\bbr\b/.test(accept)) return "br";
  if (/\bgzip\b/.test(accept)) return "gzip";
  return null;
}

/** @param {Buffer} body @param {"br" | "gzip"} encoding */
function compress(body, encoding) {
  return encoding === "br"
    ? brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
    : gzipSync(body);
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.length > 1 && pathname.endsWith("/")) {
    res.writeHead(308, { Location: `${pathname.slice(0, -1)}${url.search}` });
    res.end();
    return;
  }

  const file = resolve(pathname);
  const status = file ? 200 : 404;
  const target = file ?? join(OUT, "404.html");
  const ext = extname(target);
  let body = readFileSync(target);
  const etag = `"${createHash("sha256").update(body).digest("base64url").slice(0, 27)}"`;

  /** @type {Record<string, string>} */
  const headers = {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Cache-Control": "public, max-age=0, must-revalidate",
    ETag: etag,
    Vary: "Accept-Encoding",
  };
  for (const rule of headerRules) {
    if (rule.test.test(pathname)) for (const h of rule.headers) headers[h.key] = h.value;
  }

  if (status === 200 && req.headers["if-none-match"] === etag) {
    res.writeHead(304, headers);
    res.end();
    return;
  }

  const accept = req.headers["accept-encoding"];
  const encoding = COMPRESSIBLE.has(ext)
    ? pickEncoding(Array.isArray(accept) ? accept.join(",") : (accept ?? ""))
    : null;
  if (encoding) {
    body = compress(body, encoding);
    headers["Content-Encoding"] = encoding;
  }
  headers["Content-Length"] = String(body.length);

  res.writeHead(status, headers);
  res.end(req.method === "HEAD" ? undefined : body);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`serving ${OUT} at http://127.0.0.1:${PORT}/ (Vercel semantics)`);
});
