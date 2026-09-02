import type { Locale } from "@/lib/i18n/locales";
import { capitalize } from "./capitalize";

/** "2025-07" -> "Juli 2025" (nl) / "July 2025" (en) / "Juillet 2025" (fr) / "Juli 2025" (de) */
export function monthYear(iso: string, locale: Locale): string {
  const [year = "", month = "1"] = iso.split("-");
  const name = new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(Number(year), Number(month) - 1, 1),
  );
  return `${capitalize(name)} ${year}`;
}
