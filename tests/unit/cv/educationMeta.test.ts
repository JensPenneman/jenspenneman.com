import { describe, expect, it } from "vitest";
import { educationMeta } from "@/lib/cv/educationMeta";

describe("educationMeta", () => {
  it("composes institution and period without a city", () => {
    expect(
      educationMeta({
        studyType: "Toegepaste informatica",
        institution: "Hogeschool Gent",
        startDate: "2020-09",
        endDate: "2023-12",
      }),
    ).toBe("bij Hogeschool Gent, September 2020 - December 2023");
  });
});
