import { describe, expect, it } from "vitest";
import { channelLinks } from "@/lib/cv/channelLinks";
import { currentEmployer } from "@/lib/cv/currentEmployer";
import { cvData } from "@/lib/cv/data";
import { languagePairs } from "@/lib/cv/languagePairs";
import { personaliaPairs } from "@/lib/cv/personaliaPairs";
import { skillPairs } from "@/lib/cv/skillPairs";
import { getLabels } from "@/lib/i18n/getLabels";

describe("view-model derivations", () => {
  it("personaliaPairs formats the birth date and joins the licence list", () => {
    const pairs = personaliaPairs(cvData.basics, "nl-BE", getLabels("nl-BE"));
    expect(pairs.map((p) => p.label)).toEqual([
      "Nationaliteit",
      "Rijbewijs",
      "Geboorteplaats",
      "Geboortedatum",
    ]);
    expect(pairs[0]?.value).toBe("Belg");
    expect(pairs[1]?.value).toBe(cvData.basics.driversLicense.join(", "));
    expect(pairs[3]?.value).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(personaliaPairs(cvData.basics, "de-BE", getLabels("de-BE"))[3]?.value).toMatch(
      /^\d{2}\.\d{2}\.\d{4}$/,
    );
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

  it("channelLinks lists the website first, then the profiles with their network as label", () => {
    const links = channelLinks(cvData.basics, "Website");
    expect(links[0]).toEqual({ url: cvData.basics.url, label: "Website" });
    expect(links.slice(1).map((l) => l.label)).toEqual(
      cvData.basics.profiles.map((p) => p.network),
    );
  });

  it("currentEmployer is the open-ended position", () => {
    expect(currentEmployer(cvData.work)?.endDate).toBeNull();
    expect(currentEmployer([])).toBeUndefined();
  });
});
