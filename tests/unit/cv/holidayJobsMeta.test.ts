import { describe, expect, it } from "vitest";
import { holidayJobsMeta } from "@/lib/cv/holidayJobsMeta";

describe("holidayJobsMeta", () => {
  const base = { count: 5, companies: ["Bpost", "Storaenso"], startYear: "2017", endYear: "2022" };
  it("adds an ellipsis when there are more companies than listed", () => {
    expect(holidayJobsMeta({ ...base, andMore: true })).toBe("bij Bpost, Storaenso… 2017 - 2022");
  });
  it("omits the ellipsis when the list is complete", () => {
    expect(holidayJobsMeta({ ...base, andMore: false })).toBe("bij Bpost, Storaenso 2017 - 2022");
  });
});
