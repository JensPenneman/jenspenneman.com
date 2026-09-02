import { expect, test } from "@playwright/test";

test.describe("print", () => {
  test("lays the sheet out at exact A4 width in print media", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ media: "print" });
    const width = await page.locator(".sheet").evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeCloseTo(793.76, 0); // 595.32pt
  });

  test("prints to exactly one A4 page", async ({ page, browserName }, testInfo) => {
    test.skip(
      browserName !== "chromium" || testInfo.project.name !== "desktop",
      "PDF export is headless-Chromium only",
    );
    await page.goto("/");
    const pdf = await page.pdf({ format: "A4", preferCSSPageSize: true, printBackground: true });
    const pages = pdf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? [];
    expect(pages).toHaveLength(1);
  });
});
