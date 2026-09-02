import { describe, expect, it } from "vitest";
import { monthYear } from "@/lib/format/monthYear";

describe("monthYear", () => {
  it("renders Dutch month names capitalized, as on the CV", () => {
    expect(monthYear("2025-07")).toBe("Juli 2025");
    expect(monthYear("2023-10")).toBe("Oktober 2023");
    expect(monthYear("2020-09")).toBe("September 2020");
    expect(monthYear("2024-05")).toBe("Mei 2024");
    expect(monthYear("2018-01")).toBe("Januari 2018");
  });
});
