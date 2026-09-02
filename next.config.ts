import type { NextConfig } from "next";

const nextConfig = {
  /* Fully static site: every route prerenders to out/, zero server code.
   * (headers/redirects/rewrites don't exist in this mode — set those on the
   * host, e.g. vercel.json, at deploy time.) */
  output: "export",

  /* Dev-time double-invoke and deprecation checks. */
  reactStrictMode: true,

  /* Statically typed <Link>/router paths, generated into .next/types
   * (checked by the strict tsconfig, which includes that directory). */
  typedRoutes: true,

  /* Explicit default: any TypeScript error fails the build — the max-strict
   * tsconfig is enforcing, not advisory. */
  typescript: { ignoreBuildErrors: false },

  /* Static hosting never sends it, but documents intent if output changes. */
  poweredByHeader: false,

  /* next/image is unused here; unoptimized keeps the static export valid
   * should one ever be introduced. */
  images: { unoptimized: true },

  /* Deliberately omitted, with reasons:
   * - compiler.removeConsole: unsupported by Turbopack (Next 16's bundler);
   *   there is no console usage to strip anyway.
   * - reactCompiler: this page ships zero client components, so the React
   *   Compiler would add a build dependency for nothing.
   * - experimental.inlineCss: docs mark it not recommended for production. */
} satisfies NextConfig;

export default nextConfig;
