import type { Locale } from "@/lib/i18n/locales";
import { monthYear } from "./monthYear";

/** "2025-07", null -> "Juli 2025 - heden" (present word supplied by the locale's labels) */
export function period(start: string, end: string | null, locale: Locale, present: string): string {
  return `${monthYear(start, locale)} - ${end ? monthYear(end, locale) : present}`;
}
