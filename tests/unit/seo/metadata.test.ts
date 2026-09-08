import { describe, expect, it } from "vitest";
import { cvData } from "@/lib/cv/data";
import { LOCALES } from "@/lib/i18n/locales";
import { buildMetadata } from "@/lib/seo/metadata";
import { pageTitle } from "@/lib/seo/pageTitle";

describe("buildMetadata", () => {
  const nl = buildMetadata("nl-BE");
  it("is anchored on the canonical site URL with per-locale canonical and hreflang", () => {
    expect(String(nl.metadataBase)).toBe(cvData.basics.url);
    expect(nl.alternates?.canonical).toBe("/nl-BE");
    const languages = nl.alternates?.languages as Record<string, string>;
    for (const l of LOCALES) expect(languages[l]).toBe(`/${l}`);
  });
  it("points x-default at the negotiating root instead of one language", () => {
    const languages = nl.alternates?.languages as Record<string, string>;
    expect(languages["x-default"]).toBe("/");
  });
  it("uses the localized name-first title, en-dashed, everywhere", () => {
    for (const locale of LOCALES) {
      const m = buildMetadata(locale);
      expect(m.title).toBe(pageTitle(locale));
      expect(m.openGraph?.title).toBe(pageTitle(locale));
      expect(m.twitter?.title).toBe(pageTitle(locale));
    }
    expect(pageTitle("de-BE")).toBe("Jens Penneman – Softwareentwickler");
    expect(pageTitle("nl-BE")).not.toContain(" - ");
  });
  it("describes each page with the short, locale-specific description", () => {
    const seen = new Set<string>();
    for (const locale of LOCALES) {
      const m = buildMetadata(locale);
      const description = cvData.basics.metaDescription[locale];
      expect(m.description).toBe(description);
      expect(m.openGraph?.description).toBe(description);
      expect(m.twitter?.description).toBe(description);
      expect(description.length).toBeLessThanOrEqual(155);
      seen.add(description);
    }
    /* four pages, four descriptions: no two locales look the same to a crawler */
    expect(seen.size).toBe(LOCALES.length);
  });
  it("drops the keywords meta, which no search engine reads", () => {
    expect(nl.keywords).toBeUndefined();
  });
  it("names the site by its domain, not by the page title", () => {
    expect(nl.openGraph).toMatchObject({ siteName: "jenspenneman.com" });
    expect((nl.openGraph as { siteName: string }).siteName).not.toBe(nl.title);
  });
  it("asks search engines to index and follow", () => {
    expect(nl.robots).toMatchObject({ index: true, follow: true });
  });
  it("describes an Open Graph profile with locale and alternates", () => {
    expect(nl.openGraph).toMatchObject({
      type: "profile",
      locale: "nl_BE",
      firstName: "Jens",
      lastName: "Penneman",
    });
    expect((nl.openGraph as { alternateLocale: string[] }).alternateLocale).toEqual([
      "en_GB",
      "fr_BE",
      "de_BE",
    ]);
  });
});
