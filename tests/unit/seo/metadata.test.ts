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
    expect(languages["x-default"]).toBe("/nl-BE");
  });
  it("uses the localized name-first title everywhere", () => {
    for (const locale of LOCALES) {
      const m = buildMetadata(locale);
      expect(m.title).toBe(pageTitle(locale));
      expect(m.openGraph?.title).toBe(pageTitle(locale));
      expect(m.twitter?.title).toBe(pageTitle(locale));
    }
    expect(pageTitle("de-BE")).toBe("Jens Penneman - Softwareentwickler");
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
