import type { Locale } from "./locales";

/** A string with a variant for every supported locale (schema-enforced). */
export type LocalizedString = Record<Locale, string>;

export function t(value: LocalizedString, locale: Locale): string {
  return value[locale];
}
