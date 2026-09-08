import { readdirSync } from "node:fs";
import { expect, type Locator, test } from "@playwright/test";
import { cvData } from "@/lib/cv/data";
import { RANGE_DASH } from "@/lib/format/rangeDash";
import { getLabels } from "@/lib/i18n/getLabels";
import { LOCALES } from "@/lib/i18n/locales";
import { pageTitle } from "@/lib/seo/pageTitle";

/** The text a sighted reader sees: everything but the assistive-technology-only
 * parts, which are in the DOM (and so in textContent) but never rendered. */
const visibleText = (locator: Locator) =>
  locator.evaluate((el) => {
    const clone = el.cloneNode(true) as HTMLElement;
    for (const hidden of clone.querySelectorAll(".vh")) hidden.remove();
    return clone.textContent ?? "";
  });

test.describe("content", () => {
  for (const locale of LOCALES) {
    test(`renders the ${locale} CV from the data model`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page).toHaveTitle(pageTitle(locale));
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        `${cvData.basics.name}, ${cvData.basics.label[locale]}`,
      );
      await expect(page.locator("section[aria-labelledby]")).toHaveCount(7);
      await expect(
        page.getByRole("heading", { level: 2, name: getLabels(locale).work }),
      ).toBeVisible();
      await expect(page.locator(`link[rel="canonical"]`)).toHaveAttribute(
        "href",
        new RegExp(`/${locale}$`),
      );
      /* x-default is the negotiating root, not the default language */
      await expect(page.locator(`link[rel="alternate"][hreflang="x-default"]`)).toHaveAttribute(
        "href",
        /^https?:\/\/[^/]+\/?$/,
      );
      for (const l of LOCALES) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${l}"]`)).toHaveAttribute(
          "href",
          new RegExp(`/${l}$`),
        );
      }
    });
  }

  test("preloads the AVIF portrait with a type so other browsers skip it", async ({ page }) => {
    await page.goto("/nl-BE");
    const preload = page.locator('link[rel="preload"][as="image"]');
    await expect(preload).toHaveCount(1);
    await expect(preload).toHaveAttribute("type", "image/avif");
    await expect(preload).toHaveAttribute(
      "imagesrcset",
      /photo-160\.[^ ]+\.avif 1x, \/img\/photo-320\.[^ ]+\.avif 2x/,
    );
    await expect(preload).toHaveAttribute("fetchpriority", "high");
  });

  test("exposes every section as a named region", async ({ page }) => {
    await page.goto("/nl-BE");
    const sections = page.locator("section[aria-labelledby]");
    await expect(sections).toHaveCount(7);
    for (const section of await sections.all()) {
      const id = await section.getAttribute("aria-labelledby");
      await expect(section.locator(`h2#${id}`)).toHaveCount(1);
    }
  });

  test("links out to email, phone and profiles, and to every language", async ({ page }) => {
    await page.goto("/nl-BE");
    await expect(page.locator(`a[href="mailto:${cvData.basics.email}"]`)).toHaveCount(1);
    await expect(page.locator(`a[href="tel:${cvData.basics.phone}"]`)).toHaveCount(1);
    for (const p of cvData.basics.profiles)
      await expect(page.locator(`a[href="${p.url}"]`)).toHaveCount(1);
    const nav = page.getByRole("navigation", { name: getLabels("nl-BE").language });
    await expect(nav.getByRole("link")).toHaveCount(LOCALES.length);
    await expect(nav.locator('a[aria-current="page"]')).toHaveText("NL");
  });

  test("negotiates the root URL from Accept-Language", async ({ request }) => {
    const cases: [string, string][] = [
      ["fr-BE,fr;q=0.9,en;q=0.8", "/fr-BE"],
      ["de-DE,de;q=0.9", "/de-BE"],
      ["en-US,en;q=0.9", "/en-GB"],
      ["nl-BE,nl;q=0.9", "/nl-BE"],
      ["es-ES", "/nl-BE"],
    ];
    for (const [header, expected] of cases) {
      const res = await request.get("/", {
        headers: { "accept-language": header },
        maxRedirects: 0,
      });
      expect(res.status(), header).toBe(307);
      expect(res.headers()["location"], header).toMatch(new RegExp(`${expected}$`));
      expect(res.headers()["vary"], header).toMatch(/Accept-Language/i);
    }
  });

  test("serves a 404 page in the CV design for unknown paths", async ({ page }) => {
    const res = await page.goto("/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      getLabels("nl-BE").notFoundTitle,
    );
    await expect(page.locator('a[href="/en-GB"]')).toBeVisible();
  });

  for (const locale of LOCALES) {
    test(`serves the ${locale} Open Graph card as a PNG`, async ({ page, request }) => {
      await page.goto(`/${locale}`);
      const og = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(og).toContain(`/${locale}/opengraph-image`);
      const res = await request.get(
        new URL(og ?? "", "https://127.0.0.1").pathname +
          new URL(og ?? "", "https://127.0.0.1").search,
      );
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toBe("image/png");
      expect((await res.body()).length).toBeGreaterThan(20_000);
    });
  }

  test("publishes an llms.txt generated from the data model", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.startsWith(`# ${cvData.basics.name}`)).toBe(true);
    expect(text).toContain("> ");
    for (const locale of LOCALES) expect(text).toContain(`/${locale})`);
    /* each page is named by the language's own name for itself, plus its tag */
    expect(text).toContain("[Nederlands (nl-BE)]");
    expect(text).toContain("[English (en-GB)]");
    expect(text).toContain("[français (fr-BE)]");
    expect(text).toContain("[Deutsch (de-BE)]");
  });

  test("dates the sitemap from the content and offers an x-default", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain(`<lastmod>${cvData.updated}</lastmod>`);
    expect(xml).not.toContain("changefreq");
    expect(xml).not.toContain("priority");
    expect(xml).toMatch(/hreflang="x-default"/);
  });

  test("sets each date range in typographic form", async ({ page }) => {
    await page.goto("/nl-BE");
    /* lower-case Dutch month names, an en dash, no hyphen, and no wrap around it */
    const first = await visibleText(page.locator(".jobs .meta").first());
    expect(first).toBe(`bij Advantitge te Deinze, juli 2025${RANGE_DASH}heden`);
    for (const meta of await page.locator(".jobs .meta, .opl .meta").all()) {
      const text = await visibleText(meta);
      expect(text).not.toMatch(/\d ?- ?\d/);
      expect(text).not.toMatch(/\u0020\u2013|\u2013\u0020/);
    }
    /* the range is still announced as a range, with a word instead of a dash */
    await expect(page.locator(".jobs .meta").first()).toContainText("tot heden");
  });

  test("names every link on its own, without changing what is shown", async ({ page }) => {
    await page.goto("/nl-BE");
    const website = page.getByRole("link", { name: `Website van ${cvData.basics.name}` });
    await expect(website).toHaveAttribute("href", cvData.basics.url);
    expect(await visibleText(website)).toBe("Website");
    expect(await visibleText(page.getByRole("link", { name: "NL Nederlands" }))).toBe("NL");
    await expect(page.getByRole("link", { name: "FR français" })).toHaveAttribute("href", "/fr-BE");
  });

  test("serves the IndexNow key file", async ({ request }) => {
    const key = readdirSync("public")
      .map((f) => /^([0-9a-f]{32})\.txt$/.exec(f)?.[1])
      .find((k) => k !== undefined);
    expect(key).toBeTruthy();
    const res = await request.get(`/${key}.txt`);
    expect(res.status()).toBe(200);
    expect((await res.text()).trim()).toBe(key);
  });
});
