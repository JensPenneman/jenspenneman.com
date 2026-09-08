import { defineConfig, devices } from "@playwright/test";

/* PW_PORT lets a second checkout run its own server on its own port instead
 * of reusing (or colliding with) the one already on the default. It drives
 * both the webServer command and the baseURL, so they can never disagree. */
const PORT = Number(process.env["PW_PORT"] ?? 4173);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env["CI"]);

/* The two extra viewports exist for the specs whose subject is geometry: axe
 * (target sizes, reflow, contrast of the sticky labels) and the layout
 * measurements. Running the whole E2E suite five times over would triple the
 * job for assertions that are viewport-independent. */
const GEOMETRY = /(a11y|layout)\.spec\.ts$/;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 4 } : {}),
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { baseURL: BASE_URL, trace: "on-first-retry" },
  /* `next start` needs a prior `next build` (npm run test:e2e does both). */
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `${BASE_URL}/nl-BE`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
  projects: [
    { name: "desktop", testDir: "tests/e2e", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", testDir: "tests/e2e", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", testDir: "tests/e2e", use: { ...devices["Pixel 7"] } },
    {
      name: "tablet",
      testDir: "tests/e2e",
      testMatch: GEOMETRY,
      /* The whole CV very nearly fits a 1024pt-tall viewport at this width
       * (1147px of document, 123px of scroll), so no scroll position can pin
       * the first label: the assertion has nothing to observe here, it is not
       * failing. Every other geometry assertion runs. */
      grepInvert: /pins a section label/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "big",
      testDir: "tests/e2e",
      testMatch: GEOMETRY,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
    /* macOS only (system fonts): `npm run test:visual`, CI visual job.
     * The tolerance is deliberately far below the default 1%: a full-page
     * baseline is ~2.5M pixels, so 1% would let a whole removed row pass.
     * Playwright applies the stricter of the two, i.e. 200 pixels here. */
    {
      name: "visual",
      testDir: "tests/visual",
      use: { ...devices["Desktop Chrome"] },
      expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.0005, maxDiffPixels: 200 } },
    },
  ],
});
