import { monthYear } from "@/lib/format/monthYear";
import type { Locale } from "@/lib/i18n/locales";

type Props = { start: string; end: string | null; locale: Locale; present: string };

/** "Juli 2025 - heden" with machine-readable <time> elements. */
export function Period({ start, end, locale, present }: Props) {
  return (
    <>
      <time dateTime={start}>{monthYear(start, locale)}</time>
      {" - "}
      {end ? <time dateTime={end}>{monthYear(end, locale)}</time> : present}
    </>
  );
}
