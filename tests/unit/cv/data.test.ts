import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import schema from "@/content/cv.schema.json";
import { cvData } from "@/lib/cv/data";
import { phoneDisplay } from "@/lib/format/phoneDisplay";

/** Every string value in a nested structure. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("cv.json", () => {
  it("validates against cv.schema.json (every localized field has all four locales)", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const valid = validate(cvData);
    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it("contains no em or en dashes anywhere (house rule: plain hyphens only)", () => {
    expect(strings(cvData).filter((s) => /[—–]/.test(s))).toEqual([]);
  });

  it("lists the current position first and education newest first", () => {
    expect(cvData.work[0]?.endDate).toBeNull();
    const isDescending = (dates: string[]) =>
      dates.every((d, i) => i === 0 || d <= (dates[i - 1] ?? d));
    expect(isDescending(cvData.education.map((e) => e.startDate))).toBe(true);
  });

  it("has exactly one current (open-ended) position", () => {
    expect(cvData.work.filter((w) => w.endDate === null)).toHaveLength(1);
  });

  it("has a phone number the display formatter recognises", () => {
    expect(phoneDisplay(cvData.basics.phone)).not.toBe(cvData.basics.phone);
  });

  it("uses a profile list that does not repeat the personal website", () => {
    expect(cvData.basics.profiles.map((p) => p.url)).not.toContain(cvData.basics.url);
  });
});
