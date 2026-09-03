import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/next";

/** Vercel Speed Insights (Core Web Vitals per route; no cookies, no consent
 * banner needed). Rendered only on Vercel: elsewhere its script path does not
 * exist. Its script tag is inserted by a nonced Next chunk, which
 * 'strict-dynamic' permits, and it reports to a same-origin endpoint, which
 * connect-src 'self' permits. */
export function SpeedInsights() {
  return process.env["VERCEL"] === "1" ? <VercelSpeedInsights /> : null;
}
