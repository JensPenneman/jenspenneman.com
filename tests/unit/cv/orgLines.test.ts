import { describe, expect, it } from "vitest";
import { educationOrg } from "@/lib/cv/educationOrg";
import { workOrg } from "@/lib/cv/workOrg";
import { getLabels } from "@/lib/i18n/getLabels";

const work = {
  position: { "nl-BE": "x", "en-GB": "x", "fr-BE": "x", "de-BE": "x" },
  name: "BASF",
  location: { "nl-BE": "Gent", "en-GB": "Ghent", "fr-BE": "Gand", "de-BE": "Gent" },
  startDate: "2023-10",
  endDate: "2023-12",
};
const edu = (institution: string, institutionGender: string) => ({
  studyType: { "nl-BE": "x", "en-GB": "x", "fr-BE": "x", "de-BE": "x" },
  institution,
  institutionGender,
  startDate: "2020-09",
  endDate: "2023-12",
});
const hogent = edu("Hogeschool Gent", "f");

describe("organisation lines", () => {
  it("workOrg composes company and localized city per locale", () => {
    expect(workOrg(work, "nl-BE", getLabels("nl-BE"))).toBe("bij BASF te Gent");
    expect(workOrg(work, "en-GB", getLabels("en-GB"))).toBe("at BASF in Ghent");
    expect(workOrg(work, "fr-BE", getLabels("fr-BE"))).toBe("chez BASF à Gand");
    expect(workOrg(work, "de-BE", getLabels("de-BE"))).toBe("bei BASF in Gent");
  });
  it("educationOrg has no city and uses a locative, not the employer preposition", () => {
    expect(educationOrg(hogent, getLabels("nl-BE"))).toBe("aan Hogeschool Gent");
    expect(educationOrg(hogent, getLabels("en-GB"))).toBe("at Hogeschool Gent");
    expect(educationOrg(hogent, getLabels("fr-BE"))).toBe("à Hogeschool Gent");
  });
  it("declines the German preposition after the institution's gender", () => {
    const de = getLabels("de-BE");
    expect(educationOrg(hogent, de)).toBe("an der Hogeschool Gent");
    expect(educationOrg(edu("Broederschool Stekene", "f"), de)).toBe(
      "an der Broederschool Stekene",
    );
    expect(educationOrg(edu("GTI Beveren", "n"), de)).toBe("am GTI Beveren");
    expect(educationOrg(edu("Campus", "m"), de)).toBe("am Campus");
  });
});
