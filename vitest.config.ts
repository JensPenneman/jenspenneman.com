import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      /* Everything that ships: the App Router routes and the proxy are code
       * too, and leaving them out hid whole files from the report. */
      include: ["src/**", "app/**", "proxy.ts", "instrumentation-client.ts"],
      /* Data and build artefacts, not logic: cv.json + its schema, the
       * generated portrait manifest, the font licence. */
      exclude: ["src/assets/**", "src/content/**", "**/*.d.ts"],
      reporter: ["text", "html"],
      /* The measured levels (2026-09, 56.54 / 59.03 / 72.38 / 56.70) less a
       * couple of points of slack. app/ and proxy.ts are exercised by the E2E
       * suite rather than by Vitest, which is why the floors are not higher --
       * they exist to catch a drop, not to set a target. */
      thresholds: {
        statements: 54,
        branches: 56,
        functions: 70,
        lines: 54,
      },
    },
  },
});
