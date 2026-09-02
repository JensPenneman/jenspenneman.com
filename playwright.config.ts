import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const BASE_URL = `https://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env["CI"]);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
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
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
