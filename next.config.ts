import type { NextConfig } from "next";

/* Response headers that do not depend on the request. The Content-Security-
 * Policy is per request (nonce) and therefore set in proxy.ts. */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
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

  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/img/(.*)", headers: immutable },
      { source: "/icons/(.*)", headers: immutable },
    ];
  },

  /* Deliberately omitted, with reasons:
   * - compiler.removeConsole: unsupported by Turbopack (Next 16's bundler);
   *   there is no console usage to strip anyway.
   * - reactCompiler: this page ships zero client components, so the React
   *   Compiler would add a build dependency for nothing. */
} satisfies NextConfig;

export default nextConfig;
