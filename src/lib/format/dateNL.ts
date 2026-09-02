import { LOCALE } from "./locale";

/** "2002-11-23" -> "23/11/2002" (always zero-padded) */
export function dateNL(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}
