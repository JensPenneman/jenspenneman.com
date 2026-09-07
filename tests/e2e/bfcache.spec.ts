import { expect, test } from "@playwright/test";

/* notRestoredReasons only reports anything when the browser is actually
 * running a back/forward cache, and Playwright launches Chromium with
 * --disable-back-forward-cache. Undoing that is what makes the API answer at
 * all, and it has to happen at the top level of a file: Playwright refuses
 * launchOptions inside a describe group because it forces a new worker. */
test.use({ launchOptions: { ignoreDefaultArgs: ["--disable-back-forward-cache"] } });

test.describe("back/forward cache", () => {
  test("keeps no response-level reason for holding the document out", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "notRestoredReasons is Chromium-only as of 2026");
    await page.goto("/nl-BE", { waitUntil: "load" });
    await page.click('nav.lang a[href="/en-GB"]');
    await page.waitForLoadState("load");
    await page.goBack({ waitUntil: "load" });
    await expect(page).toHaveURL(/\/nl-BE$/);
    /* the back navigation is still settling when goBack resolves; waiting on
       a function rather than a state lets Playwright retry across it */
    await page.waitForFunction(() => document.readyState === "complete");
    const reasons = await page.evaluate(() => {
      const [entry] = performance.getEntriesByType("navigation");
      const nav = entry as
        | (PerformanceNavigationTiming & { notRestoredReasons?: unknown })
        | undefined;
      if (nav === undefined || !("notRestoredReasons" in nav)) return "unsupported";
      const value = nav.notRestoredReasons as { reasons?: { reason: string }[] } | null;
      return value === null ? [] : (value.reasons ?? []).map((r) => r.reason);
    });
    expect(reasons, "notRestoredReasons is not implemented").not.toBe("unsupported");
    /* Chrome masks the whole list as soon as any non-web-exposed reason
       applies, and an attached debugger is one, so under Playwright this is
       always ["masked"] and a restore can never actually be observed here.
       What survives that masking is the useful half: no reason may blame the
       response, which is exactly what a returning `no-store` would do. */
    for (const reason of reasons) expect(reason).not.toMatch(/^response-cache-control/);
  });
});
