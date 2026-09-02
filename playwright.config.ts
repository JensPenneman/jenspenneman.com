import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const BASE_URL = `https://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env["CI"]);

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  /* Playwright defaults to half the cores; the CI runners can take all 4. */
  ...(isCI ? { workers: 4 } : {}),
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  /* The preview server is HTTPS with a self-signed certificate (see
   * scripts/serve.mjs for why plain http breaks WebKit). */
  use: { baseURL: BASE_URL, ignoreHTTPSErrors: true, trace: "on-first-retry" },
  webServer: {
    command: `node scripts/serve.mjs ${PORT}`,
    url: `${BASE_URL}/`,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !isCI,
    timeout: 30_000,
  },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  projects: [
    { name: "desktop", testDir: "tests/e2e", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", testDir: "tests/e2e", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", testDir: "tests/e2e", use: { ...devices["Pixel 7"] } },
    /* macOS only (system fonts): `npm run test:visual`, CI visual job */
    { name: "visual", testDir: "tests/visual", use: { ...devices["Desktop Chrome"] } },
  ],
});
