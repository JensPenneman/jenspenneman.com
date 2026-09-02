import { expect, test } from "@playwright/test";
import { LOCALES } from "@/lib/i18n/locales";

test.describe("print", () => {
  test("lays the sheet out at exact A4 width in print media", async ({ page }) => {
    await page.goto("/nl-BE");
    await page.emulateMedia({ media: "print" });
    const width = await page.locator(".sheet").evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeCloseTo(793.76, 0); // 595.32pt
  });

  test("never prints in dark or high-contrast mode", async ({ page }) => {
    await page.emulateMedia({ media: "print", colorScheme: "dark", contrast: "more" });
    await page.goto("/nl-BE");
    // Computed colors serialize as authored (lch(...)); normalize via a canvas pixel.
    const colors = await page.evaluate(() => {
      const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
      const rgb = (css: string) => {
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      };
      const of = (sel: string, prop: "color" | "backgroundColor") =>
        rgb(getComputedStyle(document.querySelector(sel) as Element)[prop]);
      return {
        body: of("body", "backgroundColor"),
        h1: of("h1", "color"),
        label: of("h2", "color"),
      };
    });
    expect(colors.body).toEqual([255, 255, 255]);
    expect(colors.h1).toEqual([0, 0, 0]);
    for (const channel of colors.label) expect(channel).toBeGreaterThan(120);
    for (const channel of colors.label) expect(channel).toBeLessThan(135);
  });

  for (const locale of LOCALES) {
    test(`prints ${locale} to exactly one A4 page`, async ({ page, browserName }, testInfo) => {
      test.skip(
        browserName !== "chromium" || testInfo.project.name !== "desktop",
        "PDF export is headless-Chromium only",
      );
      await page.goto(`/${locale}`);
      const pdf = await page.pdf({ format: "A4", preferCSSPageSize: true, printBackground: true });
      const pages = pdf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? [];
      expect(pages).toHaveLength(1);
    });
  }
});
