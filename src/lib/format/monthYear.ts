import type { Locale } from "@/lib/i18n/locales";

/** "2025-07" -> "juli 2025" (nl) / "July 2025" (en) / "juillet 2025" (fr) /
 * "Juli 2025" (de). Intl already capitalizes exactly where the language does:
 * English and German capitalize month names, Dutch and French do not. */
export function monthYear(iso: string, locale: Locale): string {
  const [year = "", month = "1"] = iso.split("-");
  const name = new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(Number(year), Number(month) - 1, 1),
  );
  return `${name} ${year}`;
}
