import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

/** Picks the best supported locale for an Accept-Language header value,
 * honouring q-values; matches on the language subtag ("fr-FR" -> fr-BE). */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number.parseFloat(q.slice(2)) : 1;
      return {
        language: tag.toLowerCase().split("-")[0] ?? "",
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
