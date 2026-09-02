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
    expect(ld.dateModified).toBe("2026-09-02");
  });

  it("carries Google's recommended disambiguation fields", () => {
    expect(ld.mainEntity.sameAs).toEqual(cvData.basics.profiles.map((p) => p.url));
    expect(ld.mainEntity.image).toBe("https://example.test/photo.jpg");
    expect(ld.mainEntity.worksFor).toEqual({ "@type": "Organization", name: "Advantitge" });
  });

  it("is serialisable without loss", () => {
    expect(JSON.parse(JSON.stringify(ld))).toEqual(ld);
  });
});
