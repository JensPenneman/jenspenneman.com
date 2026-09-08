import type { Locale } from "./locales";

/** The language's own name for itself, spelled as that language spells it
 * ("Nederlands", "English", "français", "Deutsch"). ICU knows the answer for
 * the bare language subtag; the regional tag would yield a regional variety
 * ("Vlaams") that no reader uses as the language's name. */
export function endonym(locale: Locale): string {
  return new Intl.DisplayNames(locale, { type: "language" }).of(locale.slice(0, 2)) ?? locale;
}
