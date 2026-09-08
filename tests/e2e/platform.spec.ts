import { expect, type Page, test } from "@playwright/test";
import { LOCALES } from "@/lib/i18n/locales";

const CSP_NONCE = /script-src 'nonce-([A-Za-z0-9+/=]+)'/;

/** The speculation-rules block, read out of the raw server HTML.
 *
 * Parsed with `DOMParser` for the same reason security.spec.ts does it: the
 * document has no browsing context, so nothing runs and the nonce attribute
 * stays readable, while the real tokenizer -- not a regular expression --
 * decides what is a script element. */
function parseSpeculationRules(page: Page, html: string) {
  return page.evaluate((markup) => {
    const doc = new DOMParser().parseFromString(markup, "text/html");
    const el = doc.querySelector<HTMLElement>('script[type="speculationrules"]');
    return el === null
      ? null
      : { nonce: el.nonce || el.getAttribute("nonce") || "", text: el.textContent ?? "" };
  }, html);
}

/** Records every listener type the page registers, before any of its own
 * scripts can run, so the audit sees registrations rather than intentions. */
async function recordListeners(page: Page) {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __listeners: string[] }).__listeners = seen;
    for (const target of [window, document]) {
      const original = target.addEventListener.bind(target);
      target.addEventListener = ((type: string, ...rest: unknown[]) => {
        seen.push(type);
        return (original as unknown as (t: string, ...r: unknown[]) => void)(type, ...rest);
      }) as typeof target.addEventListener;
    }
  });
}

test.describe("platform behaviours", () => {
  test("serves the document bfcache-eligible: private and revalidating, never no-store", async ({
    request,
  }) => {
    for (const locale of LOCALES) {
      const cacheControl = (await request.get(`/${locale}`)).headers()["cache-control"] ?? "";
      /* A shared cache must not keep a response that carries a single-use
         nonce, and no cache may serve one without revalidating. */
      expect(cacheControl, locale).toContain("private");
      expect(cacheControl, locale).toContain("max-age=0");
      expect(cacheControl, locale).toContain("must-revalidate");
      /* The two directives engines read as back/forward-cache blockers:
         `no-store` in Firefox, `no-cache` in Firefox on an HTTPS origin. */
      expect(cacheControl, locale).not.toContain("no-store");
      expect(cacheControl, locale).not.toContain("no-cache");
    }
  });

  test("registers no unload listener, the one handler that forfeits the bfcache", async ({
    page,
  }) => {
    await recordListeners(page);
    await page.goto("/nl-BE", { waitUntil: "load" });
    await page.waitForLoadState("networkidle");
    const types = await page.evaluate(
      () => (window as unknown as { __listeners: string[] }).__listeners,
    );
    expect(types).not.toContain("unload");
  });

  for (const locale of LOCALES) {
    test(`prefetches the sibling locales of ${locale} from a nonced speculation-rules script`, async ({
      page,
      request,
    }) => {
      const res = await request.get(`/${locale}`);
      const nonce = res.headers()["content-security-policy"]?.match(CSP_NONCE)?.[1];
      expect(nonce).toBeTruthy();
      const rules = await parseSpeculationRules(page, await res.text());
      expect(rules).not.toBeNull();
      /* CSP guards speculation rules through script-src, so the block needs
         the response nonce exactly like every other script on the page. */
      expect(rules?.nonce).toBe(nonce);
      const parsed = JSON.parse(rules?.text ?? "") as {
        prefetch: { where: { href_matches: string[] }; eagerness: string }[];
      };
      /* prefetch, never prerender: a prerender would execute the document and
         book a page view for a locale nobody visited. */
      expect(Object.keys(parsed)).toEqual(["prefetch"]);
      expect(parsed.prefetch).toHaveLength(1);
      expect(parsed.prefetch[0]?.eagerness).toBe("moderate");
      /* a document rule, not a urls list: WebKit fetches a urls list
         eagerly on load, ignoring eagerness entirely */
      expect(parsed.prefetch[0]?.where.href_matches).toEqual(
        LOCALES.filter((l) => l !== locale).map((l) => `/${l}`),
      );
    });
  }

  test("prefetches on hover, and the prefetched document still carries the CSP", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Speculation Rules is Chromium-only as of 2026");
    const prefetched: { url: string; csp: string }[] = [];
    page.on("response", (res) => {
      if (res.request().headers()["sec-purpose"] !== undefined) {
        prefetched.push({ url: res.url(), csp: res.headers()["content-security-policy"] ?? "" });
      }
    });
    await page.goto("/nl-BE", { waitUntil: "load" });
    await page.hover('nav.lang a[href="/en-GB"]');
    await expect
      .poll(() => prefetched.length, { message: "hover did not trigger a prefetch" })
      .toBeGreaterThan(0);
    const hit = prefetched.find((p) => p.url.endsWith("/en-GB"));
    expect(hit, "the hovered locale was not the prefetched one").toBeTruthy();
    /* The prefetched response *is* the navigation once the link is clicked,
       so it must arrive with a policy of its own -- the proxy matcher has a
       Sec-Purpose entry precisely so this never comes back empty. */
    expect(hit?.csp).toMatch(CSP_NONCE);
  });

  test("switches locale through a cross-document view transition", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "cross-document view transitions: Chromium and Safari");
    await page.addInitScript(() => {
      const revealed: boolean[] = [];
      (window as unknown as { __revealed: boolean[] }).__revealed = revealed;
      addEventListener("pagereveal", (event) => {
        revealed.push((event as { viewTransition?: unknown }).viewTransition != null);
      });
    });
    await page.goto("/nl-BE", { waitUntil: "load" });
    await page.click('nav.lang a[href="/en-GB"]');
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/\/en-GB$/);
    /* pagereveal carries a ViewTransition only when the engine actually held
       the old frame and animated into the new one. */
    const revealed = await page.evaluate(
      () => (window as unknown as { __revealed: boolean[] }).__revealed,
    );
    expect(revealed).toContain(true);
  });

  test("runs no view transition when the reader asked for less motion", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "cross-document view transitions: Chromium and Safari");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      const revealed: boolean[] = [];
      (window as unknown as { __revealed: boolean[] }).__revealed = revealed;
      addEventListener("pagereveal", (event) => {
        revealed.push((event as { viewTransition?: unknown }).viewTransition != null);
      });
    });
    await page.goto("/nl-BE", { waitUntil: "load" });
    await page.click('nav.lang a[href="/en-GB"]');
    await page.waitForLoadState("load");
    const revealed = await page.evaluate(
      () => (window as unknown as { __revealed: boolean[] }).__revealed,
    );
    expect(revealed).not.toContain(true);
    /* the whole motion block is gated, so the transition name goes too */
    const name = await page
      .locator(".photo")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("view-transition-name"));
    expect(name === "" || name === "none").toBe(true);
  });

  test("answers a Global Privacy Control request with a document that measures nothing", async ({
    request,
  }) => {
    /* Vercel's two measurement scripts exist only on Vercel, so their absence
       here is not by itself evidence; the gate is unit-tested where VERCEL can
       be stubbed (tests/unit/components/AnalyticsScripts.test.tsx). What this
       pins is that a Sec-GPC request is still answered with the whole CV --
       the signal removes measurement, not content. */
    const response = await request.get("/nl-BE", { headers: { "Sec-GPC": "1" } });
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).not.toContain("/_vercel/insights");
    expect(html).not.toContain("/_vercel/speed-insights");
    expect(html).toContain("speculationrules");
    expect(html).toContain("application/ld+json");
  });

  test("declares viewport-fit cover and pads the body with the safe-area insets", async ({
    page,
  }) => {
    await page.goto("/nl-BE");
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      /viewport-fit=cover/,
    );
    /* the insets resolve to 0px on a display without a notch, so assert the
       authored declaration rather than the computed value */
    const authored = await page.evaluate(() => {
      const found: string[] = [];
      const walk = (rules: CSSRuleList) => {
        for (const rule of rules) {
          if (rule.cssText.includes("safe-area-inset")) found.push(rule.cssText.slice(0, 200));
          if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules);
        }
      };
      for (const sheet of document.styleSheets) {
        try {
          walk(sheet.cssRules);
        } catch {
          /* cross-origin sheet: none of ours */
        }
      }
      return found;
    });
    expect(authored.length).toBeGreaterThan(0);
    expect(authored.join(" ")).toContain("env(safe-area-inset-top");
  });

  test("marks the portrait as the high-priority LCP image, decoded before first paint", async ({
    page,
  }) => {
    await page.goto("/nl-BE");
    const img = page.locator("img.photo");
    await expect(img).toHaveAttribute("fetchpriority", "high");
    await expect(img).toHaveAttribute("decoding", "sync");
  });

  test("keeps every platform behaviour off the printed page", async ({ page }) => {
    await page.goto("/nl-BE");
    const onScreen = await page.evaluate(() => ({
      scroll: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    expect(onScreen.scroll).toBe("smooth");

    await page.emulateMedia({ media: "print" });
    const inPrint = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const photo = document.querySelector(".photo");
      return {
        scroll: getComputedStyle(document.documentElement).scrollBehavior,
        padding: [body.paddingTop, body.paddingRight, body.paddingLeft],
        touch: getComputedStyle(document.querySelector("a") as Element).getPropertyValue(
          "touch-action",
        ),
        name:
          photo === null
            ? ""
            : getComputedStyle(photo).getPropertyValue("view-transition-name") || "none",
      };
    });
    expect(inPrint.scroll).toBe("auto");
    expect(inPrint.padding).toEqual(["0px", "0px", "0px"]);
    expect(inPrint.touch).toBe("auto");
    expect(inPrint.name).toBe("none");
  });

  test("switches locale with no console errors and no CSP violations", async ({ page }) => {
    /* WebKit honours the rule on hover exactly as Chromium does -- including
       the mouse move Playwright makes before a click -- but refuses a
       speculative prefetch from a plain-HTTP origin and says so on the
       console. The test server is http://127.0.0.1 while production is
       HTTPS-only (HSTS preload), so this one message is a property of the
       origin under test and nothing else is tolerated. */
    const insecurePrefetch = /Prefetch request denied: URL must be secure/;
    const problems: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !insecurePrefetch.test(msg.text())) problems.push(msg.text());
    });
    page.on("requestfailed", (req) => problems.push(`${req.url()} -> ${req.failure()?.errorText}`));
    await page.addInitScript(() => {
      const violations: string[] = [];
      (window as unknown as { __violations: string[] }).__violations = violations;
      addEventListener("securitypolicyviolation", (event) => {
        violations.push(`${event.violatedDirective} ${event.blockedURI}`);
      });
    });
    await page.goto("/nl-BE", { waitUntil: "load" });
    await page.hover('nav.lang a[href="/fr-BE"]');
    await page.click('nav.lang a[href="/fr-BE"]');
    await page.waitForLoadState("load");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/fr-BE$/);
    const violations = await page.evaluate(
      () => (window as unknown as { __violations: string[] }).__violations,
    );
    expect(violations).toEqual([]);
    expect(problems).toEqual([]);
  });
});
