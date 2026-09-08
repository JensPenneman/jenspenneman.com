import { type NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@/lib/i18n/locales";
import { negotiateLocale } from "@/lib/i18n/negotiateLocale";

/** The CSP violation collector (app/csp/route.ts). First party: the reports
 * never leave the deployment. */
const REPORT_PATH = "/csp";

/** The only methods a document has an answer for; OPTIONS advertises them. */
const ALLOW = "GET, HEAD";

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
    /* names the Reporting-Endpoints group below; reporting only, it grants
     * nothing */
    "report-to csp",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/** A plain URL on this request's origin. NextURL (nextUrl.clone()) carries
 * the request's own trailing-slash shape and puts it back when it is
 * serialized, which would make the redirect below point at itself. */
function to(request: NextRequest, pathname: string): URL {
  const url = new URL(request.url);
  url.pathname = pathname;
  return url;
}

/** BCP 47 tags are case-insensitive (RFC 5646 2.1.1), so "/NL-be" names the
 * same document as "/nl-BE" -- which is the spelling we publish. */
function canonicalCasing(segment: string): Locale | undefined {
  const lower = segment.toLowerCase();
  return LOCALES.find((locale) => locale.toLowerCase() === lower);
}

/** "/nl" is not a URL of ours, but it unambiguously asks for the locale whose
 * primary subtag it is. */
function primarySubtagOf(segment: string): Locale | undefined {
  const lower = segment.toLowerCase();
  return LOCALES.find((locale) => locale.toLowerCase().split("-")[0] === lower);
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  /* The report collector is an API, not a document: it answers POST, needs no
   * nonce of its own and must never be redirected -- a browser does not
   * follow a redirect when delivering a report. */
  if (pathname === REPORT_PATH) {
    /* Next answers an unimplemented method on a route handler with a bare
     * 405; RFC 9110 15.5.6 requires Allow on it. */
    const response = NextResponse.next();
    response.headers.set("Allow", "OPTIONS, POST");
    return response;
  }

  /* A document is a read-only resource. Without this, Next answers a POST or
   * a DELETE with 200 and the page, which tells a client its write succeeded. */
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: { Allow: `${ALLOW}, OPTIONS` } });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new NextResponse(null, { status: 405, headers: { Allow: ALLOW } });
  }

  /* skipTrailingSlashRedirect (next.config.ts) keeps PostHog's own slashed
   * endpoints intact under the /pulse/* rewrites, but it also switches off
   * Next's redirect for the pages -- leaving "/nl-BE/" answering 200 next to
   * "/nl-BE". One document, one URL: send the slashed spelling home. The
   * rewrites are outside the matcher below, so they never reach this. */
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return NextResponse.redirect(to(request, pathname.replace(/\/+$/, "") || "/"), 308);
  }

  if (pathname === "/") {
    const locale = negotiateLocale(request.headers.get("accept-language"));
    const response = NextResponse.redirect(to(request, `/${locale}`), 307);
    response.headers.set("Vary", "Accept-Language");
    return response;
  }

  const [, first = "", ...rest] = pathname.split("/");
  if (!isLocale(first)) {
    /* Same document, different spelling of the tag -- permanent. */
    const canonical = canonicalCasing(first);
    if (canonical) {
      return NextResponse.redirect(to(request, ["", canonical, ...rest].join("/")), 308);
    }
    /* Which locale a bare subtag resolves to is ours to change (today "/nl"
     * is Belgian Dutch, tomorrow it need not be) -- temporary. */
    const primary = primarySubtagOf(first);
    if (primary) {
      return NextResponse.redirect(to(request, ["", primary, ...rest].join("/")), 307);
    }
  }

  const nonce = createNonce();
  const https =
    nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  const csp = contentSecurityPolicy(nonce, https);
  const locale: Locale = isLocale(first) ? first : DEFAULT_LOCALE;

  /* Next reads the nonce from the request's CSP header and applies it to the
   * scripts and styles it emits; x-nonce lets our own components read it.
   * x-locale is how global-not-found.tsx -- which bypasses [locale] and so
   * has no route params -- learns which language the URL asked for. */
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);
  requestHeaders.set("x-locale", locale);
  const init = { request: { headers: requestHeaders } };

  /* A single unknown segment would match /[locale]; send it to a path no
   * route matches so global-not-found renders it (status stays 404). */
  const response = isLocale(first)
    ? NextResponse.next(init)
    : NextResponse.rewrite(new URL(`/404${pathname}`, request.url), init);
  response.headers.set("Content-Security-Policy", csp);
  /* Where "report-to csp" sends a violation. Same origin, no third party. */
  response.headers.set("Reporting-Endpoints", `csp="${REPORT_PATH}"`);
  /* The document's own language, for clients that never parse the markup. */
  response.headers.set("Content-Language", locale);
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
   * strictly and still keep in the back/forward cache.
   *
   * Effective wherever the Next server sends the document itself. On Vercel
   * the page function's own Cache-Control takes priority over this header
   * (documented), so production keeps Next's default there. */
  response.headers.set("Cache-Control", "private, max-age=0, must-revalidate");
  return response;
}

export const config = {
  matcher: [
    /* Everything except Next internals, the PostHog proxy, static files
     * (anything with a dot) and the OG images.
     *
     * No `missing` clause on prefetch headers: this app renders no <Link>, so
     * there are no RSC prefetches to exempt, and every engine spelling of a
     * prefetch (`Purpose`, `Sec-Purpose`, `next-router-prefetch`) asks for a
     * real document whose response becomes the navigation -- which must carry
     * a CSP or the navigation lands unprotected. */
    "/((?!_next/|pulse/|img/|icons/|\\.well-known/|.*opengraph-image|.*\\..*).*)",
  ],
};
