import { describe, expect, it } from "vitest";
import { workMeta } from "@/lib/cv/workMeta";

describe("workMeta", () => {
  it("composes the CV's meta line for a current job", () => {
    expect(
      workMeta({
        position: "Full stack software engineer",
        name: "Advantitge",
        location: "Deinze",
        startDate: "2025-07",
        endDate: null,
      }),
    ).toBe("bij Advantitge te Deinze, Juli 2025 - heden");
  });
  it("composes the meta line for a finished job", () => {
    expect(
      workMeta({
        position: "Stagiair front end engineer",
        name: "BASF",
        location: "Gent",
        startDate: "2023-10",
        endDate: "2023-12",
      }),
    ).toBe("bij BASF te Gent, Oktober 2023 - December 2023");
  });
});
