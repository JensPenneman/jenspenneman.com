import { expect, test } from "@playwright/test";

/* Pixel baselines for the layouts that took the most tuning. Snapshots are
 * platform-suffixed by Playwright; they are recorded and compared on macOS
 * (fonts), see the visual job in CI. */
test.describe("visual regression", () => {
  test("desktop", async ({ page }) => {
    await page.goto("/nl-BE");
    await expect(page).toHaveScreenshot("desktop.png", { fullPage: true });
  });

  test("dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/nl-BE");
    await expect(page).toHaveScreenshot("desktop-dark.png", { fullPage: true });
  });

  test("mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/nl-BE");
    await expect(page).toHaveScreenshot("mobile.png", { fullPage: true });
  });

  test("print", async ({ page }) => {
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.emulateMedia({ media: "print" });
    await page.goto("/nl-BE");
    await expect(page).toHaveScreenshot("print.png", { fullPage: true });
  });
});
