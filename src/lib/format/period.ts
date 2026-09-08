import type { Locale } from "@/lib/i18n/locales";
import { monthYear } from "./monthYear";
import { RANGE_DASH } from "./rangeDash";

/** "2025-07", null -> "juli 2025 – heden" (present word supplied by the
 * locale's labels), joined by the no-break en dash. */
export function period(start: string, end: string | null, locale: Locale, present: string): string {
  return `${monthYear(start, locale)}${RANGE_DASH}${end ? monthYear(end, locale) : present}`;
}
