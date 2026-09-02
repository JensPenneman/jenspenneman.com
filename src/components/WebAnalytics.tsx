import { Analytics } from "@vercel/analytics/next";

/** Vercel Web Analytics (cookieless, no consent banner needed). Rendered only
 * on Vercel: elsewhere its script path does not exist. Its script tag is
 * inserted by a nonced Next chunk, which 'strict-dynamic' permits. */
export function WebAnalytics() {
  return process.env["VERCEL"] === "1" ? <Analytics /> : null;
}
