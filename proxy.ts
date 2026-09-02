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
  return response;
}

export const config = {
  matcher: [
    {
      /* everything except static assets and metadata files, and not router prefetches */
      source: "/((?!_next/|pulse/|img/|icons/|.well-known/|.*opengraph-image|.*..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
