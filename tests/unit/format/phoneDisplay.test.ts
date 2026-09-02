import { describe, expect, it } from "vitest";
import { phoneDisplay } from "@/lib/format/phoneDisplay";

describe("phoneDisplay", () => {
  it("groups Belgian mobile numbers the way the CV prints them", () => {
    expect(phoneDisplay("+32474180683")).toBe("+32\u00a0474\u00a018\u00a006\u00a083");
  });
  it("passes other numbers through untouched", () => {
    expect(phoneDisplay("+31612345678")).toBe("+31612345678");
    expect(phoneDisplay("+3221234567")).toBe("+3221234567");
  });
});
