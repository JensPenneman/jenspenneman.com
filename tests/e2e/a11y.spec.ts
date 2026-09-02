import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("accessibility", () => {
  test("passes axe at WCAG 2.2 AAA plus best practices", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag2aaa",
        "wcag21a",
        "wcag21aa",
        "wcag22aa",
        "best-practice",
      ])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("passes axe AAA in dark mode too", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe("rgb(255, 255, 255)");
    const results = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag2aaa",
        "wcag21a",
        "wcag21aa",
        "wcag22aa",
        "best-practice",
      ])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("increased contrast: darker inks, heavier lines, underlined links, still AAA", async ({
    page,
  }) => {
    await page.emulateMedia({ contrast: "more" });
    await page.goto("/");
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
    const results = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag2aaa",
        "wcag21a",
        "wcag21aa",
        "wcag22aa",
        "best-practice",
      ])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("increased contrast in dark mode stays AAA", async ({ page }) => {
    await page.emulateMedia({ contrast: "more", colorScheme: "dark" });
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag2aaa",
        "wcag21a",
        "wcag21aa",
        "wcag22aa",
        "best-practice",
      ])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("forced colors: structure survives via borders and underlines", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit does not implement forced-colors emulation");
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/");
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
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
  });
});
