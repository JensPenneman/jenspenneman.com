import { describe, expect, it } from "vitest";
import { period } from "@/lib/format/period";

describe("period", () => {
  it("joins start and end with a plain hyphen (never an em dash)", () => {
    expect(period("2024-07", "2025-05", "nl-BE", "heden")).toBe("Juli 2024 - Mei 2025");
    expect(period("2024-07", "2025-05", "nl-BE", "heden")).not.toMatch(/[—–]/);
  });
  it("renders an open end with the locale's present word", () => {
    expect(period("2025-07", null, "nl-BE", "heden")).toBe("Juli 2025 - heden");
    expect(period("2025-07", null, "en-GB", "present")).toBe("July 2025 - present");
  });
});
