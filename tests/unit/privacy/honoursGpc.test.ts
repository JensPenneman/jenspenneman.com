import { describe, expect, it } from "vitest";
import { honoursGpc } from "@/lib/privacy/honoursGpc";

describe("honoursGpc", () => {
  it("honours the one value the specification defines", () => {
    expect(honoursGpc("1")).toBe(true);
  });

  it("treats an absent header as no signal", () => {
    expect(honoursGpc(null)).toBe(false);
    expect(honoursGpc(undefined)).toBe(false);
  });

  it("does not invent consent out of any other value", () => {
    for (const value of ["0", "", "true", "yes", "1 ", " 1"]) {
      expect(honoursGpc(value), value).toBe(false);
    }
  });
});
