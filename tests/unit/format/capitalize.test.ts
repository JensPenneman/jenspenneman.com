import { describe, expect, it } from "vitest";
import { capitalize } from "@/lib/format/capitalize";

describe("capitalize", () => {
  it("uppercases only the first character", () => {
    expect(capitalize("juli")).toBe("Juli");
    expect(capitalize("Juli")).toBe("Juli");
  });
  it("handles the empty string", () => {
    expect(capitalize("")).toBe("");
  });
});
