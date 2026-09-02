import { expect, test } from "@playwright/test";

test.describe("security invariants of the export", () => {
  test("ships no executable JavaScript", async ({ page }) => {
    await page.goto("/nl-BE");
    const scripts = await page
      .locator("script")
      .evaluateAll((els) => els.map((el) => el.getAttribute("type")));
    expect(scripts).toEqual(["application/ld+json"]);
  });

  test("declares a strict CSP as the first element in <head>", async ({ page }) => {
    await page.goto("/nl-BE");
    const first = await page.evaluate(() => {
      const el = document.head.firstElementChild;
      return { httpEquiv: el?.getAttribute("http-equiv"), content: el?.getAttribute("content") };
    });
    expect(first.httpEquiv).toBe("Content-Security-Policy");
    expect(first.content).toContain("default-src 'none'");
    expect(first.content).toContain("manifest-src 'self'");
    expect(first.content).not.toContain("unsafe-inline");
  });

  test("loads with no console errors, CSP violations or failed requests", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("requestfailed", (req) => errors.push(`${req.url()} -> ${req.failure()?.errorText}`));
    await page.goto("/nl-BE", { waitUntil: "load" });
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("uses no inline styles and only same-origin resources", async ({ page }) => {
    await page.goto("/nl-BE");
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

  test("root fallback page is script-free with the same CSP", async ({ request }) => {
    const res = await request.get("/", { headers: { "accept-language": "" }, maxRedirects: 0 });
    // the local server negotiates like Vercel; fetch the static file directly
    expect([307, 200]).toContain(res.status());
    const html = await (await request.get("/index.html")).text();
    expect(html).not.toMatch(/<script/);
    expect(html).toContain("Content-Security-Policy");
    expect(html).toContain('hreflang="x-default"');
  });
});
