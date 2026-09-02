import { describe, expect, it } from "vitest";
import { addressLine } from "@/lib/format/addressLine";

describe("addressLine", () => {
  it("composes street, postal code, city and country", () => {
    expect(
      addressLine({
        address: "Teerlingstraat 69/2",
        postalCode: "9190",
        city: "Stekene",
        country: "België",
      }),
    ).toBe("Teerlingstraat 69/2, 9190 Stekene, België");
  });
});
