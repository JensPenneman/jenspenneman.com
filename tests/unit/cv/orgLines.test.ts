import { describe, expect, it } from "vitest";
import { educationOrg } from "@/lib/cv/educationOrg";
import { workOrg } from "@/lib/cv/workOrg";

describe("organisation lines", () => {
  it("workOrg composes company and city", () => {
    expect(
      workOrg({
        position: "x",
        name: "Advantitge",
        location: "Deinze",
        startDate: "2025-07",
        endDate: null,
      }),
    ).toBe("bij Advantitge te Deinze");
  });
  it("educationOrg has no city", () => {
    expect(
      educationOrg({
        studyType: "x",
        institution: "Hogeschool Gent",
        startDate: "2020-09",
        endDate: "2023-12",
      }),
    ).toBe("bij Hogeschool Gent");
  });
});
