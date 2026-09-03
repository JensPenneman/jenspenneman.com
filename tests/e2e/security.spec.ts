import { expect, type Page, test } from "@playwright/test";

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

/** Reads the raw server response through the browser's own HTML parser.
 *
 * Markup is never matched with a regular expression: `DOMParser` runs the real
 * tokenizer, so `<SCRIPT>`, unusual whitespace, stray attributes, comments and
 * malformed end tags are seen exactly as the browser sees them instead of
 * slipping past a hand-written pattern. The parsed document has no browsing
 * context, so nothing loads or executes and the nonce attributes stay readable
 * — this still inspects the *server* HTML, not the live, client-mutated DOM.
 */
function parseServerHtml(page: Page, html: string) {
  return page.evaluate((markup) => {
    const doc = new DOMParser().parseFromString(markup, "text/html");
    return {
      /* Every element CSP guards with a nonce: scripts (inline, external and
       * data blocks such as JSON-LD) and style elements. `el.nonce` is the
       * parsed nonce; the attribute is the fallback for engines without it. */
      nonced: [...doc.querySelectorAll<HTMLElement>("script, style")].map((el) => ({
        nonce: el.nonce || el.getAttribute("nonce") || "",
        type: el.getAttribute("type") ?? "",
        markup: el.outerHTML.slice(0, 120),
      })),
      httpEquiv: [...doc.querySelectorAll("meta[http-equiv]")].map((el) =>
        (el.getAttribute("http-equiv") ?? "").toLowerCase(),
      ),
    };
  }, html);
}

test.describe("security invariants", () => {
  test("sends a strict nonce-based CSP header, no meta CSP, no unsafe-inline", async ({
    page,
    request,
  }) => {
    const res = await request.get("/nl-BE");
    const csp = res.headers()["content-security-policy"] ?? "";
    expect(csp).toMatch(CSP);
    expect(csp).not.toContain("unsafe-inline");
    const { httpEquiv } = await parseServerHtml(page, await res.text());
    expect(httpEquiv).not.toContain("content-security-policy");
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

  test("every script and style element carries the response nonce", async ({ page, request }) => {
    const res = await request.get("/nl-BE");
    const nonce = res.headers()["content-security-policy"]?.match(CSP)?.[1];
    expect(nonce).toBeTruthy();
    const { nonced } = await parseServerHtml(page, await res.text());
    expect(nonced.length).toBeGreaterThan(0);
    // the JSON-LD data block is a script element too, so it needs a nonce
    expect(nonced.map((el) => el.type)).toContain("application/ld+json");
    for (const el of nonced) expect(el.nonce, el.markup).toBe(nonce);
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
