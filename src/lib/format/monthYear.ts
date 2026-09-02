import { capitalize } from "./capitalize";
import { LOCALE } from "./locale";

/** "2025-07" -> "Juli 2025" */
export function monthYear(iso: string): string {
  const [year = "", month = "1"] = iso.split("-");
  const name = new Intl.DateTimeFormat(LOCALE, { month: "long" }).format(
    new Date(Number(year), Number(month) - 1, 1),
  );
  return `${capitalize(name)} ${year}`;
}
