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
const edu = {
  studyType: { "nl-BE": "x", "en-GB": "x", "fr-BE": "x", "de-BE": "x" },
  institution: "Hogeschool Gent",
  startDate: "2020-09",
  endDate: "2023-12",
};

describe("organisation lines", () => {
  it("workOrg composes company and localized city per locale", () => {
    expect(workOrg(work, "nl-BE", getLabels("nl-BE"))).toBe("bij BASF te Gent");
    expect(workOrg(work, "en-GB", getLabels("en-GB"))).toBe("at BASF in Ghent");
    expect(workOrg(work, "fr-BE", getLabels("fr-BE"))).toBe("chez BASF à Gand");
    expect(workOrg(work, "de-BE", getLabels("de-BE"))).toBe("bei BASF in Gent");
  });
  it("educationOrg has no city", () => {
    expect(educationOrg(edu, getLabels("nl-BE"))).toBe("bij Hogeschool Gent");
    expect(educationOrg(edu, getLabels("fr-BE"))).toBe("à Hogeschool Gent");
  });
});
