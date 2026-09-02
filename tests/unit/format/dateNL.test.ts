import { describe, expect, it } from "vitest";
import { dateNL } from "@/lib/format/dateNL";

describe("dateNL", () => {
  it("formats an ISO date as dd/mm/yyyy", () => {
    expect(dateNL("2002-11-23")).toBe("23/11/2002");
    expect(dateNL("2020-01-05")).toBe("05/01/2020");
  });
});
