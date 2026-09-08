import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

/** Picks the best supported locale for an Accept-Language header value,
 * honouring q-values; matches on the language subtag ("fr-FR" -> fr-BE).
 *
 * RFC 9110 12.4.2 allows optional whitespace around the ";" that introduces a
 * parameter, so "fr ;q=0.9" is a well-formed range for French -- the tag is
 * trimmed rather than compared with its trailing space attached. Tags are
 * case-insensitive (RFC 5646 2.1.1), hence the lowercasing. */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number.parseFloat(q.slice(2)) : 1;
      return {
        language: tag.trim().toLowerCase().split("-")[0] ?? "",
        weight: Number.isNaN(weight) ? 0 : weight,
        index,
      };
    })
    .filter((c) => c.language && c.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  for (const { language } of ranked) {
    const match = LOCALES.find((locale) => locale.toLowerCase().startsWith(`${language}-`));
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}
