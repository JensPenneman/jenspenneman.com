import { describe, expect, it } from "vitest";
import { monthYear } from "@/lib/format/monthYear";

describe("monthYear", () => {
  it("renders capitalized month names per locale, as on the CV", () => {
    expect(monthYear("2025-07", "nl-BE")).toBe("Juli 2025");
    expect(monthYear("2023-10", "nl-BE")).toBe("Oktober 2023");
    expect(monthYear("2025-07", "en-GB")).toBe("July 2025");
    expect(monthYear("2025-07", "fr-BE")).toBe("Juillet 2025");
    expect(monthYear("2025-07", "de-BE")).toBe("Juli 2025");
    expect(monthYear("2018-01", "fr-BE")).toBe("Janvier 2018");
  });
});
