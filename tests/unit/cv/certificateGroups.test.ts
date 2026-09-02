import { describe, expect, it } from "vitest";
import { certificateGroups } from "@/lib/cv/certificateGroups";

const L = (s: string) => ({ "nl-BE": s, "en-GB": s, "fr-BE": s, "de-BE": s });

describe("certificateGroups", () => {
  it("groups by localized issuer, preserving first-seen order", () => {
    const groups = certificateGroups(
      [
        { name: L("A"), date: "2024-07", issuer: L("X") },
        { name: L("B"), date: "2022-07", issuer: L("Y") },
        { name: L("C"), date: "2021-07", issuer: L("X") },
      ],
      "nl-BE",
    );
    expect(groups.map((g) => g.issuer)).toEqual(["X", "Y"]);
    expect(groups[0]?.certificates.map((c) => c.name["nl-BE"])).toEqual(["A", "C"]);
  });
});
