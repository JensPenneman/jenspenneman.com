import { describe, expect, it } from "vitest";
import { monthYear } from "@/lib/format/monthYear";

describe("monthYear", () => {
  it("leaves the month name cased the way the language cases it", () => {
    /* Dutch and French write month names in lower case (Taaladvies; Lexique
       de l'Imprimerie nationale); English and German capitalize them. */
    expect(monthYear("2025-07", "nl-BE")).toBe("juli 2025");
    expect(monthYear("2023-10", "nl-BE")).toBe("oktober 2023");
    expect(monthYear("2025-07", "fr-BE")).toBe("juillet 2025");
    expect(monthYear("2018-01", "fr-BE")).toBe("janvier 2018");
    expect(monthYear("2025-07", "en-GB")).toBe("July 2025");
    expect(monthYear("2025-07", "de-BE")).toBe("Juli 2025");
  });
});
