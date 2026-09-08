import { describe, expect, it } from "vitest";
import { period } from "@/lib/format/period";
import { RANGE_DASH } from "@/lib/format/rangeDash";

const NBSP = "\u00a0";

describe("period", () => {
  it("joins start and end with an en dash, never a hyphen or em dash", () => {
    expect(RANGE_DASH).toBe(`${NBSP}– `);
    expect(period("2024-07", "2025-05", "nl-BE", "heden")).toBe(`juli 2024${NBSP}– mei 2025`);
    expect(period("2024-07", "2025-05", "nl-BE", "heden")).not.toMatch(/[-—]/);
  });
  it("lets a line break fall only after the dash, never before it", () => {
    const range = period("2025-07", null, "nl-BE", "heden");
    expect(range).toContain(RANGE_DASH);
    expect(range).not.toMatch(/ –/);
    expect(range).toMatch(/–\u0020/);
  });
  it("renders an open end with the locale's present word", () => {
    expect(period("2025-07", null, "nl-BE", "heden")).toBe(`juli 2025${NBSP}– heden`);
    expect(period("2025-07", null, "en-GB", "present")).toBe(`July 2025${NBSP}– present`);
  });
});
