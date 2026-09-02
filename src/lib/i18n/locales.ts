/** Supported locales as BCP 47 tags; they double as URL path segments. */
export const LOCALES = ["nl-BE", "en-GB", "fr-BE", "de-BE"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl-BE";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** "nl-BE" -> "nl_BE" (Open Graph locale format) */
export function ogLocale(locale: Locale): string {
  return locale.replace("-", "_");
}
