import { describe, expect, it } from "vitest";
import { negotiateLocale } from "@/lib/i18n/negotiateLocale";

describe("negotiateLocale", () => {
  it("matches on the language subtag", () => {
    expect(negotiateLocale("fr-FR,fr;q=0.9,en;q=0.8")).toBe("fr-BE");
    expect(negotiateLocale("de-DE,de;q=0.9")).toBe("de-BE");
    expect(negotiateLocale("en-US,en;q=0.9")).toBe("en-GB");
    expect(negotiateLocale("nl")).toBe("nl-BE");
  });
  it("honours q-values over order", () => {
    expect(negotiateLocale("en;q=0.5,fr;q=0.9")).toBe("fr-BE");
    expect(negotiateLocale("es,fr;q=0.8,en;q=0.9")).toBe("en-GB");
  });
  it("falls back to the default for unknown, empty or malformed values", () => {
    expect(negotiateLocale("es-ES")).toBe("nl-BE");
    expect(negotiateLocale("")).toBe("nl-BE");
    expect(negotiateLocale(null)).toBe("nl-BE");
    expect(negotiateLocale("*;q=abc")).toBe("nl-BE");
  });
});
