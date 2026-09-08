import { describe, expect, it } from "vitest";
import { RANGE_DASH } from "@/lib/format/rangeDash";
import { getLabels } from "@/lib/i18n/getLabels";
import { DEFAULT_LOCALE, isLocale, LOCALES, ogLocale } from "@/lib/i18n/locales";

describe("locales", () => {
  it("exposes the four BCP 47 tags with nl-BE as default", () => {
    expect(LOCALES).toEqual(["nl-BE", "en-GB", "fr-BE", "de-BE"]);
    expect(DEFAULT_LOCALE).toBe("nl-BE");
    expect(isLocale("fr-BE")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(ogLocale("en-GB")).toBe("en_GB");
  });
  it("has labels for every locale, free of stray dashes, with working templates", () => {
    for (const locale of LOCALES) {
      const l = getLabels(locale);
      for (const v of Object.values(l)) if (typeof v === "string") expect(v).not.toMatch(/[—–]/);
      expect(l.workOrg("Acme", "Gent")).toContain("Acme");
      expect(l.educationOrg("Acme", "f")).toContain("Acme");
      expect(l.holidayJobs(5)).toContain("5");
      expect(l.holidayJobsMeta("A, B", "2017", "2022")).toContain(`2017${RANGE_DASH}2022`);
      expect(l.website.owner("Jens Penneman")).toContain("Jens Penneman");
      expect(l.issuedBy(1)).toBeTruthy();
    }
  });
  it("keeps the counted labels from breaking after the plus sign", () => {
    for (const locale of LOCALES) expect(getLabels(locale).holidayJobs(5)).toMatch(/^\+\u00a05 /);
  });
  it("writes French with typographic apostrophes and a French semicolon", () => {
    const fr = getLabels("fr-BE");
    for (const v of Object.values(fr)) if (typeof v === "string") expect(v).not.toContain("'");
    expect(fr.present).toBe("aujourd’hui");
    expect(fr.holidayJobs(5)).toContain("jobs d’étudiant");
    expect(fr.notFoundText).toBe("Cette page n’existe pas.");
    expect(fr.listSeparator).toBe("\u202f; ");
  });
  it("agrees the French issuer phrase with the number of certificates", () => {
    expect(getLabels("fr-BE").issuedBy(1)).toBe("délivré par");
    expect(getLabels("fr-BE").issuedBy(2)).toBe("délivrés par");
    expect(getLabels("nl-BE").issuedBy(2)).toBe("uitgereikt door");
    expect(getLabels("de-BE").issuedBy(2)).toBe("ausgestellt von");
    expect(getLabels("en-GB").issuedBy(2)).toBe("issued by");
  });
});
