import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import schema from "@/content/cv.schema.json" with { type: "json" };
import { cvData } from "@/lib/cv/data";
import { phoneDisplay } from "@/lib/format/phoneDisplay";

/** Every string value in a nested structure. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

type Json = Record<string, unknown>;

/** A deep copy of the real CV with one value replaced, or removed when the
 * replacement is `undefined`. Path segments address array items by index. */
function broken(path: string, value: unknown): unknown {
  const copy = structuredClone(cvData) as unknown as Json;
  const keys = path.split(".");
  const last = keys.pop() ?? "";
  let node = copy;
  for (const key of keys) node = node[key] as Json;
  if (value === undefined) delete node[last];
  else node[last] = value;
  return copy;
}

describe("cv.json", () => {
  it("validates against cv.schema.json (every localized field has all four locales)", () => {
    const valid = validate(cvData);
    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it("contains no em or en dashes anywhere (house rule: plain hyphens only)", () => {
    expect(strings(cvData).filter((s) => /[—–]/.test(s))).toEqual([]);
  });

  it("writes its French with typographic apostrophes", () => {
    expect(strings(cvData).filter((s) => s.includes("'"))).toEqual([]);
  });

  it("carries a content date the JSON-LD and the sitemap can both quote", () => {
    expect(cvData.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("keeps every meta description short enough for a search result", () => {
    for (const description of Object.values(cvData.basics.metaDescription))
      expect(description.length).toBeLessThanOrEqual(155);
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

describe("cv.schema.json rejects", () => {
  const cases: [string, string, unknown][] = [
    ["a missing content date", "updated", undefined],
    ["a content date that is not ISO", "updated", "09-09-2026"],
    ["a country this CV does not know", "basics.location.countryCode", "NL"],
    ["a driving-licence category that does not exist", "basics.driversLicense", ["X"]],
    ["a repeated driving-licence category", "basics.driversLicense", ["B", "B"]],
    ["an http site URL", "basics.url", "http://jenspenneman.com/"],
    ["an http profile URL", "basics.profiles.0.url", "http://github.com/JensPenneman"],
    ["an empty profile list", "basics.profiles", []],
    ["an empty certificate list", "certificates", []],
    [
      "a meta description too long for a search result",
      "basics.metaDescription.nl-BE",
      "x".repeat(156),
    ],
    ["an institution gender that is not a gender", "education.0.institutionGender", "x"],
    ["an institution without a gender", "education.0.institutionGender", undefined],
  ];

  for (const [what, path, value] of cases)
    it(what, () => {
      expect(validate(broken(path, value))).toBe(false);
    });
});
