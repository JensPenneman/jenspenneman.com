import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { LOCALES } from "@/lib/i18n/locales";

/* The design claims WCAG 2.2 AAA, so every level tag up to and including AAA
 * is audited -- 2.1 AAA and 2.2 AAA included -- plus axe's best practices. */
const TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag2aaa",
  "wcag21a",
  "wcag21aa",
  "wcag21aaa",
  "wcag22aa",
  "wcag22aaa",
  "best-practice",
];

const violations = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(TAGS).analyze()).violations;

type Media = Parameters<Page["emulateMedia"]>[0];

/* Every colour mode the stylesheet answers to, except forced-colors: the
 * system supplies those colours, so auditing them audits the OS theme. */
const MODES: ReadonlyArray<{ name: string; media: Media }> = [
  { name: "light", media: {} },
  { name: "dark", media: { colorScheme: "dark" } },
  { name: "increased contrast", media: { contrast: "more" } },
  { name: "increased contrast, dark", media: { contrast: "more", colorScheme: "dark" } },
];

/* Both shapes of 404: an unknown first segment (rewritten by proxy.ts) and an
 * unknown segment under a real locale (no route matches). */
const NOT_FOUND = ["/does-not-exist", "/fr-BE/does-not-exist"];

test.describe("accessibility", () => {
  for (const locale of LOCALES) {
    test(`passes axe at WCAG 2.2 AAA plus best practices (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}`);
      expect(await violations(page)).toEqual([]);
    });
  }

  test("passes axe AAA in dark mode too", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/nl-BE");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe("rgb(255, 255, 255)");
    expect(await violations(page)).toEqual([]);
  });

  test("increased contrast: darker inks, heavier lines, underlined links, still AAA", async ({
    page,
  }) => {
    await page.emulateMedia({ contrast: "more" });
    await page.goto("/nl-BE");
    const probe = await page.evaluate(() => {
      const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
      const rgb = (css: string) => {
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      };
      const dd = document.querySelector(".pairs dd") as Element;
      const link = document.querySelector(".links a") as Element;
      return {
        label: rgb(getComputedStyle(document.querySelector("h2") as Element).color),
        lineWidth: Number.parseFloat(getComputedStyle(dd, "::before").borderBottomWidth),
        underline: getComputedStyle(link).textDecorationLine,
      };
    });
    for (const channel of probe.label) expect(channel).toBeLessThan(0x30);
    expect(probe.lineWidth).toBeGreaterThan(1.2);
    expect(probe.underline).toContain("underline");
    expect(await violations(page)).toEqual([]);
  });

  test("increased contrast in dark mode stays AAA", async ({ page }) => {
    await page.emulateMedia({ contrast: "more", colorScheme: "dark" });
    await page.goto("/nl-BE");
    expect(await violations(page)).toEqual([]);
  });

  for (const path of NOT_FOUND) {
    for (const { name, media } of MODES) {
      test(`404 ${path} passes axe AAA (${name})`, async ({ page }) => {
        await page.emulateMedia(media);
        const response = await page.goto(path);
        expect(response?.status()).toBe(404);
        expect(await violations(page)).toEqual([]);
      });
    }
  }

  test("forced colors: structure survives via borders and underlines", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit does not implement forced-colors emulation");
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/nl-BE");
    const probe = await page.evaluate(() => {
      const dd = document.querySelector(".pairs dd") as Element;
      const link = document.querySelector(".links a") as Element;
      const before = getComputedStyle(dd, "::before");
      return {
        lineStyle: before.borderBottomStyle,
        lineWidth: Number.parseFloat(before.borderBottomWidth),
        underline: getComputedStyle(link).textDecorationLine,
      };
    });
    expect(probe.lineStyle).toBe("solid");
    expect(probe.lineWidth).toBeGreaterThan(0);
    expect(probe.underline).toContain("underline");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("img")).toBeVisible();
  });

  test("has a single h1 and a main landmark", async ({ page }) => {
    await page.goto("/nl-BE");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
  });
});
