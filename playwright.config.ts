import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env["CI"]);

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
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  projects: [
    { name: "desktop", testDir: "tests/e2e", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", testDir: "tests/e2e", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", testDir: "tests/e2e", use: { ...devices["Pixel 7"] } },
    /* macOS only (system fonts): `npm run test:visual`, CI visual job */
    { name: "visual", testDir: "tests/visual", use: { ...devices["Desktop Chrome"] } },
  ],
});
