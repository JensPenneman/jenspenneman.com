import { describe, expect, it } from "vitest";
import { cvData } from "@/lib/cv/data";
import { buildJsonLd } from "@/lib/seo/jsonLd";

describe("buildJsonLd", () => {
  const base = new URL("https://example.test/");
  const ld = buildJsonLd(
    cvData,
    "nl-BE",
    new URL("/photo.jpg", base),
    new Date("2026-09-02T10:00:00Z"),
    base,
  );

  it("is a ProfilePage wrapping a Person, with a shared Person id across locales", () => {
    expect(ld["@type"]).toBe("ProfilePage");
    expect(ld.url).toBe("https://example.test/nl-BE");
    expect(ld.inLanguage).toBe("nl-BE");
    expect(ld.mainEntity["@id"]).toBe("https://example.test/#person");
    const fr = buildJsonLd(cvData, "fr-BE", new URL("/photo.jpg", base), new Date(), base);
    expect(fr.mainEntity["@id"]).toBe(ld.mainEntity["@id"]);
    expect(fr.mainEntity.jobTitle).toBe("Ingénieur logiciel");
  });

  it("dates the profile from the content, not from the render", () => {
    expect(ld.dateModified).toBe(cvData.updated);
    expect(ld.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const later = buildJsonLd(cvData, "nl-BE", new URL("/photo.jpg", base), new Date(), base);
    expect(later.dateModified).toBe(ld.dateModified);
  });

  it("carries Google's recommended disambiguation fields", () => {
    expect(ld.mainEntity.sameAs).toEqual(cvData.basics.profiles.map((p) => p.url));
    expect(ld.mainEntity.image).toBe("https://example.test/photo.jpg");
    expect(ld.mainEntity.worksFor).toEqual({ "@type": "Organization", name: "Advantitge" });
  });

  it("names a country as the nationality, not a demonym", () => {
    expect(ld.mainEntity.nationality).toEqual({ "@type": "Country", name: "België" });
    const en = buildJsonLd(cvData, "en-GB", new URL("/photo.jpg", base), new Date(), base);
    expect(en.mainEntity.nationality).toEqual({ "@type": "Country", name: "Belgium" });
  });

  it("is serialisable without loss", () => {
    expect(JSON.parse(JSON.stringify(ld))).toEqual(ld);
  });
});
