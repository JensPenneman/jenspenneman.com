import type { Locale } from "@/lib/i18n/locales";

/** "2002-11-23" -> "23/11/2002" (nl/en/fr) or "23.11.2002" (de), always zero-padded */
export function dateLocal(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}
