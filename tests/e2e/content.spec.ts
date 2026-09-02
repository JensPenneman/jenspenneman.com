import { expect, test } from "@playwright/test";
import { cvData } from "@/lib/cv/data";
import { getLabels } from "@/lib/i18n/getLabels";
import { LOCALES } from "@/lib/i18n/locales";
import { pageTitle } from "@/lib/seo/pageTitle";

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
      await expect(page.locator(`link[rel="alternate"][hreflang="x-default"]`)).toHaveAttribute(
        "href",
        /\/nl-BE$/,
      );
      for (const l of LOCALES) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${l}"]`)).toHaveAttribute(
          "href",
          new RegExp(`/${l}$`),
        );
      }
    });
  }

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
      expect(res.headers()["location"], header).toBe(expected);
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
});
