import { describe, expect, it } from "vitest";
import { certificateGroups } from "@/lib/cv/certificateGroups";

describe("certificateGroups", () => {
  it("groups by issuer, preserving first-seen order", () => {
    const groups = certificateGroups([
      { name: "A", date: "2024-07", issuer: "X" },
      { name: "B", date: "2022-07", issuer: "Y" },
      { name: "C", date: "2021-07", issuer: "X" },
    ]);
    expect(groups.map((g) => g.issuer)).toEqual(["X", "Y"]);
    expect(groups[0]?.certificates.map((c) => c.name)).toEqual(["A", "C"]);
  });
});
