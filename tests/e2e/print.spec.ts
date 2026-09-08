import { expect, type Page, test } from "@playwright/test";
import { channelLinks } from "@/lib/cv/channelLinks";
import { cvData } from "@/lib/cv/data";
import { LOCALES } from "@/lib/i18n/locales";
import { occurrences, pdfLinkUris, pdfText } from "./pdfText";

const A4_HEIGHT_PT = 841.92; // 297mm
/* The sheet must not merely fit: a hair of growth (one longer translation,
 * one extra certificate) must not spill onto a second page unnoticed. */
const HEADROOM_PT = 12;
const toPt = (px: number) => (px * 72) / 96;

/** Website + the social profiles; the print stylesheet prints their URLs. */
const CHANNEL_URLS = channelLinks(cvData.basics, "").map((link) => link.url);
/** mailto, tel and one per channel: every link a printed page can carry over. */
const EXPECTED_LINK_COUNT = 2 + CHANNEL_URLS.length;

const sheetPdf = (page: Page) =>
  page.pdf({ format: "A4", preferCSSPageSize: true, printBackground: true });

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
      const pdf = await sheetPdf(page);
      const pages = pdf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? [];
      expect(pages).toHaveLength(1);
    });
  }

  test("every locale leaves headroom on the A4 sheet and they all end level", async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== "chromium" || testInfo.project.name !== "desktop",
      "one measurement of the print layout is enough",
    );
    const heights = new Map<string, number>();
    for (const locale of LOCALES) {
      await page.goto(`/${locale}`);
      await page.emulateMedia({ media: "print" });
      const px = await page.locator(".sheet").evaluate((el) => el.getBoundingClientRect().height);
      heights.set(locale, toPt(px));
      await page.emulateMedia({ media: null });
    }
    for (const [locale, pt] of heights) {
      expect(pt, `${locale} sheet height in pt`).toBeLessThanOrEqual(A4_HEIGHT_PT - HEADROOM_PT);
    }
    const measured = [...heights.values()];
    expect(Math.max(...measured) - Math.min(...measured)).toBeLessThanOrEqual(0.5);
  });

  test("prints every channel URL exactly once", async ({ page, browserName }, testInfo) => {
    test.skip(
      browserName !== "chromium" || testInfo.project.name !== "desktop",
      "PDF export is headless-Chromium only",
    );
    await page.goto("/nl-BE");
    const text = pdfText(await sheetPdf(page));
    for (const url of CHANNEL_URLS) expect(occurrences(text, url), url).toBe(1);
  });

  test("carries every link into the PDF as a link annotation", async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== "chromium" || testInfo.project.name !== "desktop",
      "PDF export is headless-Chromium only",
    );
    await page.goto("/nl-BE");
    const uris = pdfLinkUris(await sheetPdf(page));
    expect(uris).toHaveLength(EXPECTED_LINK_COUNT);
    for (const url of CHANNEL_URLS) expect(uris).toContain(url);
  });
});
