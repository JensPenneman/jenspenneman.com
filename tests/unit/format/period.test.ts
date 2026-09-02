import { describe, expect, it } from "vitest";
import { PRESENT, period } from "@/lib/format/period";

describe("period", () => {
  it("joins start and end with a plain hyphen (never an em dash)", () => {
    expect(period("2024-07", "2025-05")).toBe("Juli 2024 - Mei 2025");
    expect(period("2024-07", "2025-05")).not.toMatch(/[—–]/);
  });
  it("renders an open end as heden", () => {
    expect(period("2025-07", null)).toBe(`Juli 2025 - ${PRESENT}`);
  });
});
