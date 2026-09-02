import { describe, expect, it } from "vitest";
import { dateLocal } from "@/lib/format/dateLocal";

describe("dateLocal", () => {
  it("formats zero-padded dates in each locale's convention", () => {
    expect(dateLocal("2002-11-23", "nl-BE")).toBe("23/11/2002");
    expect(dateLocal("2020-01-05", "nl-BE")).toBe("05/01/2020");
    expect(dateLocal("2002-11-23", "en-GB")).toBe("23/11/2002");
    expect(dateLocal("2002-11-23", "fr-BE")).toBe("23/11/2002");
    expect(dateLocal("2002-11-23", "de-BE")).toBe("23.11.2002");
  });
});
