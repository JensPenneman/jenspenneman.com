import { headers } from "next/headers";
import { honoursGpc } from "@/lib/privacy/honoursGpc";

/** Vercel Web Analytics and Speed Insights, as the two script tags Vercel
 * documents for a manual installation. Both are cookieless, so no consent
 * banner is needed; both are same-origin, so `connect-src 'self'` covers the
 * beacons and `script-src` covers the tags once they carry the request nonce.
 *
 * Plain tags rather than the `@vercel/analytics` and `@vercel/speed-insights`
 * React components: those two were the only client components in the app, and
 * they shipped 15.6 kB of loader to insert markup the server already knows how
 * to write. Nothing else in the packages was used -- no route override, no
 * `beforeSend`, no custom endpoint -- so the loaders were pure overhead.
 *
 * `data-sdkn`/`data-sdkv` are the packages' own attribution telemetry and
 * `data-route` only exists to collapse a dynamic route into one row; the four
 * locales are four real pages, so per-path reporting is what we want.
 *
 * Rendered only on Vercel: elsewhere neither script path exists. Reading the
 * headers is deferred behind that check so a self-hosted or local build keeps
 * rendering statically. */
export async function AnalyticsScripts() {
  if (process.env["VERCEL"] !== "1") return null;
  const requestHeaders = await headers();
  /* Global Privacy Control is a request-time opt-out, so it is honoured at
     request time: the reader receives a document with no measurement in it. */
  if (honoursGpc(requestHeaders.get("sec-gpc"))) return null;
  /* set per request by proxy.ts */
  const nonce = requestHeaders.get("x-nonce") ?? undefined;
  return (
    <>
      <script defer nonce={nonce} src="/_vercel/insights/script.js" />
      <script defer nonce={nonce} src="/_vercel/speed-insights/script.js" />
    </>
  );
}
