import { describe, expect, it } from "vitest";
import { channelLinks } from "@/lib/cv/channelLinks";
import { currentEmployer } from "@/lib/cv/currentEmployer";
import { cvData } from "@/lib/cv/data";
import { languagePairs } from "@/lib/cv/languagePairs";
import { personaliaPairs } from "@/lib/cv/personaliaPairs";
import { skillPairs } from "@/lib/cv/skillPairs";

describe("view-model derivations", () => {
  it("personaliaPairs formats the birth date and joins the licence list", () => {
    const labels = personaliaPairs(cvData.basics);
    expect(labels.map((p) => p.label)).toEqual([
      "Nationaliteit",
      "Rijbewijs",
      "Geboorteplaats",
      "Geboortedatum",
    ]);
    expect(labels[1]?.value).toBe(cvData.basics.driversLicense.join(", "));
    expect(labels[3]?.value).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("skillPairs joins keywords with a comma", () => {
    expect(skillPairs([{ name: "Frontend", keywords: ["React", "NextJS"] }])).toEqual([
      { label: "Frontend", value: "React, NextJS" },
    ]);
  });

  it("languagePairs puts fluency as the label", () => {
    expect(languagePairs([{ language: "Engels", fluency: "Zeer goed" }])).toEqual([
      { label: "Zeer goed", value: "Engels" },
    ]);
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
