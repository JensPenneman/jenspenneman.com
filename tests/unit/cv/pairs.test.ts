import { describe, expect, it } from "vitest";
import { channelLinks } from "@/lib/cv/channelLinks";
import { currentEmployer } from "@/lib/cv/currentEmployer";
import { cvData } from "@/lib/cv/data";
import { languagePairs } from "@/lib/cv/languagePairs";
import { personaliaPairs } from "@/lib/cv/personaliaPairs";
import { skillPairs } from "@/lib/cv/skillPairs";
import { getLabels } from "@/lib/i18n/getLabels";
import type { LOCALES } from "@/lib/i18n/locales";

describe("view-model derivations", () => {
  it("personaliaPairs lists the personalia", () => {
    const pairs = personaliaPairs(cvData.basics, "nl-BE", getLabels("nl-BE"));
    expect(pairs.map((p) => p.label)).toEqual(["Nationaliteit", "Rijbewijs", "Geboorteplaats"]);
    expect(pairs[0]?.value).toBe("Belg");
    expect(pairs[2]?.value).toBe("Sint-Niklaas");
  });

  it("joins the licence categories the way each language joins a list", () => {
    const licence = (locale: (typeof LOCALES)[number]) =>
      personaliaPairs(cvData.basics, locale, getLabels(locale))[1]?.value;
    expect(licence("nl-BE")).toBe("AM en B");
    expect(licence("en-GB")).toBe("AM and B");
    expect(licence("fr-BE")).toBe("AM et B");
    expect(licence("de-BE")).toBe("AM und B");
  });

  it("skillPairs joins keywords with a comma and localizes the category", () => {
    const skill = {
      name: {
        "nl-BE": "Cloud en tooling",
        "en-GB": "Cloud & tooling",
        "fr-BE": "Cloud et outils",
        "de-BE": "Cloud & Tooling",
      },
      keywords: ["AWS", "Vercel"],
    };
    expect(skillPairs([skill], "fr-BE")).toEqual([
      { label: "Cloud et outils", value: "AWS, Vercel" },
    ]);
  });

  it("languagePairs puts fluency as the label", () => {
    expect(languagePairs(cvData.languages, "en-GB")[0]).toEqual({
      label: "Native language",
      value: "Dutch",
    });
  });

  it("channelLinks lists the website first, then the profiles, each with an owner phrase", () => {
    const links = channelLinks(cvData.basics, getLabels("nl-BE").website);
    expect(links[0]).toEqual({
      url: cvData.basics.url,
      label: "Website",
      owner: `van ${cvData.basics.name}`,
    });
    expect(links.slice(1).map((l) => l.label)).toEqual(
      cvData.basics.profiles.map((p) => p.network),
    );
    expect(links.every((l) => l.owner === `van ${cvData.basics.name}`)).toBe(true);
    expect(channelLinks(cvData.basics, getLabels("fr-BE").website)[0]).toMatchObject({
      label: "Site web",
      owner: `de ${cvData.basics.name}`,
    });
  });

  it("currentEmployer is the open-ended position", () => {
    expect(currentEmployer(cvData.work)?.endDate).toBeNull();
    expect(currentEmployer([])).toBeUndefined();
  });
});
