import { expect, type Page, test } from "@playwright/test";
import { getLabels } from "@/lib/i18n/getLabels";
import { LOCALES } from "@/lib/i18n/locales";

/** A 404 page is a 404 response, and every engine logs the navigation's own
 * status as a console error. That one line is the status, not a fault on the
 * page: everything else -- a blocked script, a CSP violation, a failed
 * subresource -- must be absent. */
function collectRealErrors(page: Page, url: string): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const ownStatus = msg.location().url === url && /status of 404/.test(msg.text());
    if (!ownStatus) errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (req) => errors.push(`${req.url()} -> ${req.failure()?.errorText}`));
  return errors;
}

test.describe("HTTP semantics", () => {
  test("redirects a trailing slash to the one canonical URL", async ({ request }) => {
    /* skipTrailingSlashRedirect is on for the /pulse/* rewrites, so without
     * proxy.ts every page would answer on two URLs. */
    for (const [from, to] of [
      ["/nl-BE/", "/nl-BE"],
      ["/en-GB/", "/en-GB"],
      ["/does-not-exist/", "/does-not-exist"],
      ["/nl-BE/?utm_source=x", "/nl-BE?utm_source=x"],
    ]) {
      const res = await request.get(from ?? "", { maxRedirects: 0 });
      expect(res.status(), from).toBe(308);
      expect(new URL(res.headers()["location"] ?? "", "http://x").href, from).toBe(
        new URL(to ?? "", "http://x").href,
      );
    }
  });

  test("answers only safe methods on a document", async ({ request }) => {
    for (const method of ["POST", "PUT", "DELETE", "PATCH"]) {
      const res = await request.fetch("/nl-BE", { method, maxRedirects: 0 });
      expect(res.status(), method).toBe(405);
      expect(res.headers()["allow"], method).toBe("GET, HEAD");
    }
    const options = await request.fetch("/nl-BE", { method: "OPTIONS", maxRedirects: 0 });
    expect(options.status()).toBe(204);
    expect(options.headers()["allow"]).toBe("GET, HEAD, OPTIONS");
    for (const method of ["GET", "HEAD"]) {
      expect((await request.fetch("/nl-BE", { method })).status(), method).toBe(200);
    }
  });

  test("treats the locale path segment as the case-insensitive tag it is", async ({ request }) => {
    /* permanent: the same document, spelled differently */
    for (const from of ["/NL-be", "/nl-be", "/Nl-Be"]) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(308);
      expect(res.headers()["location"], from).toMatch(/\/nl-BE$/);
    }
    /* temporary: which locale a bare primary subtag resolves to is ours */
    for (const [from, to] of [
      ["/nl", "/nl-BE"],
      ["/en", "/en-GB"],
      ["/fr", "/fr-BE"],
      ["/de", "/de-BE"],
      ["/FR", "/fr-BE"],
    ]) {
      const res = await request.get(from ?? "", { maxRedirects: 0 });
      expect(res.status(), from).toBe(307);
      expect(res.headers()["location"], from).toMatch(new RegExp(`${to}$`));
    }
    /* anything else is still a 404, not a redirect */
    expect((await request.get("/zz", { maxRedirects: 0 })).status()).toBe(404);
  });

  test("declares the document language in the response headers", async ({ request }) => {
    for (const locale of LOCALES) {
      expect((await request.get(`/${locale}`)).headers()["content-language"], locale).toBe(locale);
    }
    expect((await request.get("/fr-BE/nope")).headers()["content-language"]).toBe("fr-BE");
    expect((await request.get("/nope")).headers()["content-language"]).toBe("nl-BE");
  });

  test("sends the CSP however the request spells a prefetch", async ({ request }) => {
    /* A prefetched response is handed to the browser as the navigation
     * itself; one served without a CSP is an unprotected page load. */
    const spellings = [
      { purpose: "prefetch" },
      { "sec-purpose": "prefetch" },
      { "sec-purpose": "prefetch;prerender" },
      { "next-router-prefetch": "1" },
      { purpose: "prefetch", "next-router-prefetch": "1" },
    ];
    for (const headers of spellings) {
      const csp = (await request.get("/nl-BE", { headers })).headers()["content-security-policy"];
      expect(csp, JSON.stringify(headers)).toMatch(/^default-src 'none'; script-src 'nonce-/);
      expect(csp, JSON.stringify(headers)).toContain("'strict-dynamic'");
    }
  });

  test("points CSP reporting at its own first-party endpoint", async ({ request }) => {
    const res = await request.get("/nl-BE");
    expect(res.headers()["reporting-endpoints"]).toBe('csp="/csp"');
    expect(res.headers()["content-security-policy"]).toContain("report-to csp");
  });

  test("collects a violation report and answers 204", async ({ request }) => {
    const report = [
      {
        age: 12,
        type: "csp-violation",
        url: "http://127.0.0.1/nl-BE",
        user_agent: "test",
        body: {
          documentURL: "http://127.0.0.1/nl-BE",
          blockedURL: "inline",
          effectiveDirective: "script-src-elem",
          disposition: "enforce",
          statusCode: 200,
        },
      },
    ];
    const res = await request.post("/csp", {
      headers: { "content-type": "application/reports+json" },
      data: report,
    });
    expect(res.status()).toBe(204);
    /* the legacy report-uri shape is accepted too */
    const legacy = await request.post("/csp", {
      headers: { "content-type": "application/csp-report" },
      data: { "csp-report": { "document-uri": "http://127.0.0.1/", "blocked-uri": "inline" } },
    });
    expect(legacy.status()).toBe(204);
    /* WebKit posts one unbatched Reporting-API envelope, not an array */
    const webkitShape = await request.post("/csp", {
      headers: { "content-type": "application/csp-report" },
      data: {
        type: "csp-violation",
        url: "http://127.0.0.1/nl-BE",
        body: {
          documentURL: "http://127.0.0.1/nl-BE",
          blockedURL: "inline",
          effectiveDirective: "script-src-elem",
          disposition: "enforce",
        },
      },
    });
    expect(webkitShape.status()).toBe(204);
  });

  test("refuses anything that is not a report", async ({ request }) => {
    const wrongType = await request.post("/csp", {
      headers: { "content-type": "text/plain" },
      data: "hello",
    });
    expect(wrongType.status()).toBe(415);
    const malformed = await request.post("/csp", {
      headers: { "content-type": "application/reports+json" },
      data: "{",
    });
    expect(malformed.status()).toBe(400);
    const oversized = await request.post("/csp", {
      headers: { "content-type": "application/reports+json" },
      data: `["${"a".repeat(100_000)}"]`,
    });
    expect(oversized.status()).toBe(413);
    for (const method of ["GET", "PUT", "DELETE"]) {
      const res = await request.fetch("/csp", { method, maxRedirects: 0 });
      expect(res.status(), method).toBe(405);
      expect(res.headers()["allow"], method).toBe("OPTIONS, POST");
    }
  });

  test("denies every powerful feature with names the engines parse", async ({ request }) => {
    const policy = (await request.get("/nl-BE")).headers()["permissions-policy"] ?? "";
    for (const feature of ["camera", "microphone", "geolocation", "browsing-topics", "usb"]) {
      expect(policy, feature).toContain(`${feature}=()`);
    }
    /* FLoC is gone and so is its feature name */
    expect(policy).not.toContain("interest-cohort");
    /* every entry denies; none delegates */
    for (const entry of policy.split(", ")) expect(entry).toMatch(/^[a-z-]+=\(\)$/);
    expect((await request.get("/nl-BE")).headers()["origin-agent-cluster"]).toBe("?1");
  });

  test("marks the content-hashed metadata assets immutable, the manifest not", async ({
    request,
  }) => {
    for (const path of ["/nl-BE/opengraph-image", "/icon0.png", "/icon1.svg", "/apple-icon.png"]) {
      expect((await request.get(path)).headers()["cache-control"], path).toBe(
        "public, max-age=31536000, immutable",
      );
    }
    /* referenced without a hash, so it must keep revalidating */
    expect((await request.get("/manifest.webmanifest")).headers()["cache-control"]).not.toContain(
      "immutable",
    );
  });

  for (const locale of LOCALES) {
    test(`serves the 404 in ${locale}, script-clean`, async ({ page, baseURL }) => {
      const url = `${baseURL}/${locale}/does-not-exist`;
      const errors = collectRealErrors(page, url);
      const res = await page.goto(url, { waitUntil: "load" });
      expect(res?.status()).toBe(404);
      await expect(page).toHaveTitle(`404 – ${getLabels(locale).notFoundTitle}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        getLabels(locale).notFoundTitle,
      );
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
    });
  }

  test("serves the default-locale 404 for a path with no locale at all", async ({
    page,
    baseURL,
  }) => {
    const url = `${baseURL}/does-not-exist`;
    const errors = collectRealErrors(page, url);
    const res = await page.goto(url, { waitUntil: "load" });
    expect(res?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", "nl-BE");
    /* the status code is text, not a heading above the h1 */
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(0);
    await expect(page.locator("section[aria-labelledby='nf'] h1#nf")).toHaveCount(1);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("gives the 404 the response nonce, so nothing on it is blocked", async ({
    page,
    request,
  }) => {
    const res = await request.get("/does-not-exist");
    const nonce = /'nonce-([A-Za-z0-9+/=]+)'/.exec(
      res.headers()["content-security-policy"] ?? "",
    )?.[1];
    expect(nonce).toBeTruthy();
    const nonces = await page.evaluate(
      (markup) => {
        const doc = new DOMParser().parseFromString(markup, "text/html");
        return [...doc.querySelectorAll<HTMLElement>("script, style")].map(
          (el) => el.nonce || el.getAttribute("nonce") || "",
        );
      },
      await res.text(),
    );
    expect(nonces.length).toBeGreaterThan(0);
    for (const value of nonces) expect(value).toBe(nonce);
  });
});
