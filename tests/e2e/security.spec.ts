import { expect, test } from "@playwright/test";

test.describe("security invariants of the export", () => {
  test("ships no executable JavaScript", async ({ page }) => {
    await page.goto("/");
    const scripts = await page
      .locator("script")
      .evaluateAll((els) => els.map((el) => el.getAttribute("type")));
    expect(scripts).toEqual(["application/ld+json"]);
  });

  test("declares a strict CSP as the first element in <head>", async ({ page }) => {
    await page.goto("/");
    const first = await page.evaluate(() => {
      const el = document.head.firstElementChild;
      return { httpEquiv: el?.getAttribute("http-equiv"), content: el?.getAttribute("content") };
    });
    expect(first.httpEquiv).toBe("Content-Security-Policy");
    expect(first.content).toContain("default-src 'none'");
    expect(first.content).not.toContain("unsafe-inline");
  });

  test("uses no inline styles and only same-origin resources", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[style]")).toHaveCount(0);
    const resources = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          'link[rel~="stylesheet"], link[rel~="preload"], link[rel~="icon"], link[rel~="apple-touch-icon"], link[rel~="manifest"], img[src]',
        ),
      ].map((el) => el.getAttribute("href") ?? el.getAttribute("src") ?? ""),
    );
    for (const url of resources) {
      expect(url, `external resource: ${url}`).toMatch(/^\//);
    }
  });
});
