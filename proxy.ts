import { type NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n/locales";
import { negotiateLocale } from "@/lib/i18n/negotiateLocale";

/** Per-request nonce: 128 random bits, base64. */
function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

function contentSecurityPolicy(nonce: string, https: boolean): string {
  return [
    "default-src 'none'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self'",
    "manifest-src 'self'",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;

  if (nextUrl.pathname === "/") {
    const locale = negotiateLocale(request.headers.get("accept-language"));
    const response = NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
    response.headers.set("Vary", "Accept-Language");
    return response;
  }

  const nonce = createNonce();
  const https =
    nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  const csp = contentSecurityPolicy(nonce, https);

  /* Next reads the nonce from the request's CSP header and applies it to the
   * scripts and styles it emits; x-nonce lets our own components read it. */
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);
  const init = { request: { headers: requestHeaders } };

  /* A single unknown segment would match /[locale]; send it to a path no
   * route matches so global-not-found renders it (status stays 404). */
  const [, first = ""] = nextUrl.pathname.split("/");
  const response =
    first && !isLocale(first)
      ? NextResponse.rewrite(new URL(`/404${nextUrl.pathname}`, request.url), init)
      : NextResponse.next(init);
  response.headers.set("Content-Security-Policy", csp);
  /* Next answers a dynamic render with `private, no-cache, no-store,
   * max-age=0, must-revalidate`, and the `no-store` in there is what keeps
   * the document out of Firefox's back/forward cache: pressing Back re-runs
   * the whole render instead of restoring the page the reader just left.
   *
   * This says the same thing to caches without that cost. `private` still
   * forbids any shared cache from storing a response that carries a
   * single-use nonce; `max-age=0` makes it stale the moment it arrives and
   * `must-revalidate` forbids serving it stale, so a normal navigation
   * always revalidates and -- there being no validator on the response --
   * always re-renders. No nonce is ever replayed.
   *
   * What is gone is the pair of directives that engines read as bfcache
   * blockers. `no-store` blocks it in Firefox (Chrome has admitted such
   * pages since 2025, Safari always did), and `no-cache` blocks it in
   * Firefox too on an HTTPS origin -- which this is -- so `no-cache` would
   * have traded one Firefox blocker for another. `max-age=0` +
   * `must-revalidate` is the one spelling all three engines cache-check
   * strictly and still keep in the back/forward cache. */
  response.headers.set("Cache-Control", "private, max-age=0, must-revalidate");
  return response;
}

export const config = {
  matcher: [
    {
      /* everything except Next internals, the PostHog proxy, static files
       * (anything with a dot) and the OG images; not router prefetches */
      source: "/((?!_next/|pulse/|img/|icons/|\\.well-known/|.*opengraph-image|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
    {
      /* A speculation-rules prefetch (layout.tsx) is a real document request
       * whose response is handed to the browser as the navigation itself, so
       * it must carry a CSP. Chrome announces it with `Sec-Purpose: prefetch`
       * and never with `purpose`, so the rule above already covers it; this
       * entry keeps that true for any engine that sends both headers, because
       * the alternative is one navigation served without a CSP. */
      source: "/((?!_next/|pulse/|img/|icons/|\\.well-known/|.*opengraph-image|.*\\..*).*)",
      has: [{ type: "header", key: "sec-purpose" }],
    },
  ],
};
