import type { NextConfig } from "next";

const DENIED_FEATURES = [
  "accelerometer",
  "attribution-reporting",
  "autoplay",
  "bluetooth",
  "browsing-topics",
  "camera",
  "compute-pressure",
  "display-capture",
  "encrypted-media",
  "fullscreen",
  "geolocation",
  "gyroscope",
  "hid",
  "identity-credentials-get",
  "idle-detection",
  "local-fonts",
  "magnetometer",
  "microphone",
  "midi",
  "otp-credentials",
  "payment",
  "picture-in-picture",
  "publickey-credentials-create",
  "publickey-credentials-get",
  "screen-wake-lock",
  "serial",
  "storage-access",
  "usb",
  "xr-spatial-tracking",
];

const PERMISSIONS_POLICY = DENIED_FEATURES.map((feature) => `${feature}=()`).join(", ");

/* Response headers that do not depend on the request. The Content-Security-
 * Policy is per request (nonce) and therefore set in proxy.ts. */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /* Deny every powerful feature: a CV reads text, it asks the browser for
   * nothing. Names are the ones the engines actually parse today -- the old
   * `interest-cohort` is gone with FLoC itself, and its successor
   * (`browsing-topics`) plus the other post-2021 additions are denied here
   * instead. Chrome logs "Unrecognized feature" for a name no engine parses,
   * so the list holds only names it accepts today -- `ambient-light-sensor`
   * and `web-share` are left out for exactly that reason. */
  { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  /* Keyed on the origin alone, never on the site: the document can never be
   * put in an agent cluster shared with another origin of jenspenneman.com. */
  { key: "Origin-Agent-Cluster", value: "?1" },
];

const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];

const nextConfig = {
  /* Dev-time double-invoke and deprecation checks. */
  reactStrictMode: true,

  /* Statically typed <Link>/router paths, generated into .next/types
   * (checked by the strict tsconfig, which includes that directory). */
  typedRoutes: true,

  /* Explicit default: any TypeScript error fails the build — the max-strict
   * tsconfig is enforcing, not advisory. */
  typescript: { ignoreBuildErrors: false },

  poweredByHeader: false,

  /* Root layout is app/[locale]/layout.tsx, so the global 404 must render a
   * full document itself (app/global-not-found.tsx). */
  experimental: { globalNotFound: true },

  /* next/image is unused here (the portrait is a hand-built <picture>). */
  images: { unoptimized: true },

  /* PostHog reverse proxy (EU region). The path is deliberately not named
   * analytics/telemetry. skipTrailingSlashRedirect keeps PostHog's own
   * trailing-slash endpoints intact. */
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/pulse/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      { source: "/pulse/:path*", destination: "https://eu.i.posthog.com/:path*" },
    ];
  },

  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/img/(.*)", headers: immutable },
      { source: "/icons/(.*)", headers: immutable },
      /* Next's metadata routes. Every reference to them carries the content
       * hash as a query string, so the bytes at a given URL never change and
       * the year is safe; manifest.webmanifest, referenced without one, is
       * deliberately not in this list and keeps revalidating. */
      { source: "/:locale/opengraph-image", headers: immutable },
      { source: "/icon0.png", headers: immutable },
      { source: "/icon1.svg", headers: immutable },
      { source: "/apple-icon.png", headers: immutable },
    ];
  },

  /* Deliberately omitted, with reasons:
   * - compiler.removeConsole: unsupported by Turbopack (Next 16's bundler);
   *   there is no console usage to strip anyway.
   * - reactCompiler: the only client component is Vercel Analytics, so the
   *   React Compiler would add a build dependency for nothing. */
} satisfies NextConfig;

export default nextConfig;
