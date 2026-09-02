import { expect, test } from "@playwright/test";

const CSP =
  /^default-src 'none'; script-src 'nonce-([A-Za-z0-9+/=]+)' 'strict-dynamic'; style-src 'self' 'nonce-\1'; img-src 'self'; manifest-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'$/;

const HEADERS: Record<string, string | RegExp> = {
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": /camera=\(\)/,
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
  "x-permitted-cross-domain-policies": "none",
};

test.describe("security invariants", () => {
  test("sends a strict nonce-based CSP header, no meta CSP, no unsafe-inline", async ({
    request,
  }) => {
    const res = await request.get("/nl-BE");
    const csp = res.headers()["content-security-policy"] ?? "";
    expect(csp).toMatch(CSP);
    expect(csp).not.toContain("unsafe-inline");
    expect(await res.text()).not.toContain('http-equiv="Content-Security-Policy"');
  });

  test("uses a fresh nonce on every response", async ({ request }) => {
    const nonces = await Promise.all(
      [1, 2].map(
        async () =>
          (await request.get("/nl-BE")).headers()["content-security-policy"]?.match(CSP)?.[1],
      ),
    );
    expect(nonces[0]).toBeTruthy();
    expect(nonces[0]).not.toBe(nonces[1]);
  });

  test("every script element carries the response nonce", async ({ request }) => {
    const res = await request.get("/nl-BE");
    const nonce = res.headers()["content-security-policy"]?.match(CSP)?.[1];
    const html = await res.text();
    const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1] ?? "");
    expect(scripts.length).toBeGreaterThan(0);
    for (const attrs of scripts) expect(attrs, attrs).toContain(`nonce="${nonce}"`);
  });

  test("sends the OWASP header set", async ({ request }) => {
    const headers = (await request.get("/nl-BE")).headers();
    for (const [key, expected] of Object.entries(HEADERS)) {
      if (typeof expected === "string") expect(headers[key], key).toBe(expected);
      else expect(headers[key], key).toMatch(expected);
    }
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
    // next-route-announcer is Next's own a11y live region (styled via CSSOM, in
    // its shadow root); everything we render must be free of inline styles
    const inlineStyled = await page.evaluate(() =>
      [...document.querySelectorAll("[style]")]
        .filter((el) => el.tagName.toLowerCase() !== "next-route-announcer")
        .map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(inlineStyled).toEqual([]);
    const resources = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          'link[rel~="stylesheet"], link[rel~="preload"], link[rel~="icon"], link[rel~="apple-touch-icon"], link[rel~="manifest"], img[src], script[src]',
        ),
      ].map(
        (el) =>
          el.getAttribute("href") ??
          el.getAttribute("src") ??
          el.getAttribute("imagesrcset")?.split(",")[0]?.trim().split(" ")[0] ??
          "",
      ),
    );
    expect(resources.length).toBeGreaterThan(0);
    for (const url of resources) expect(url, `external resource: ${url}`).toMatch(/^\//);
  });
});
