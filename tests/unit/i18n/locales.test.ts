import { describe, expect, it } from "vitest";
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
  it("has labels for every locale, free of em dashes, with working templates", () => {
    for (const locale of LOCALES) {
      const l = getLabels(locale);
      for (const v of Object.values(l)) if (typeof v === "string") expect(v).not.toMatch(/[—–]/);
      expect(l.workOrg("Acme", "Gent")).toContain("Acme");
      expect(l.holidayJobs(5)).toContain("5");
      expect(l.holidayJobsMeta("A, B", "2017", "2022")).toContain("2017 - 2022");
    }
  });
});
