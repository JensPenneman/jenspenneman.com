import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/locales";
import { speculationRules } from "@/lib/nav/speculationRules";

type Rules = { prefetch: { where: { href_matches: string[] }; eagerness: string }[] };

describe("speculationRules", () => {
  it("emits parseable JSON with a single prefetch rule", () => {
    const rules = JSON.parse(speculationRules("nl-BE")) as Rules;
    expect(Object.keys(rules)).toEqual(["prefetch"]);
    expect(rules.prefetch).toHaveLength(1);
  });

  it("never speculates the locale already being read", () => {
    for (const locale of LOCALES) {
      const rules = JSON.parse(speculationRules(locale)) as Rules;
      expect(rules.prefetch[0]?.where.href_matches).not.toContain(`/${locale}`);
      expect(rules.prefetch[0]?.where.href_matches).toHaveLength(LOCALES.length - 1);
    }
  });

  it("lists every sibling locale as a root-relative path", () => {
    const rules = JSON.parse(speculationRules("en-GB")) as Rules;
    expect(rules.prefetch[0]?.where.href_matches).toEqual(
      LOCALES.filter((locale) => locale !== "en-GB").map((locale) => `/${locale}`),
    );
  });

  it("asks for hover eagerness, so three locales are not fetched to serve one", () => {
    const rules = JSON.parse(speculationRules("fr-BE")) as Rules;
    expect(rules.prefetch[0]?.eagerness).toBe("moderate");
  });

  it("never asks for prerender, which would execute the page and book a page view", () => {
    for (const locale of LOCALES) expect(speculationRules(locale)).not.toContain("prerender");
  });
});
