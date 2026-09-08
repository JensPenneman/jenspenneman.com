import { monthYear } from "@/lib/format/monthYear";
import { RANGE_DASH } from "@/lib/format/rangeDash";
import { getLabels } from "@/lib/i18n/getLabels";
import type { Locale } from "@/lib/i18n/locales";

type Props = { start: string; end: string | null; locale: Locale; present: string };

/** "juli 2025 – heden" with machine-readable <time> elements.
 *
 * The visible en dash is typography, not language: it is hidden from the
 * accessibility tree and replaced by the locale's connective ("tot" / "to" /
 * "à" / "bis"), so the range is spoken as a range instead of as two dates
 * with a pause. The connective is read from the labels rather than passed in,
 * because the surrounding entry only hands this component a locale. */
export function Period({ start, end, locale, present }: Props) {
  return (
    <>
      <time dateTime={start}>{monthYear(start, locale)}</time>
      <span aria-hidden="true">{RANGE_DASH}</span>
      <span className="vh">{` ${getLabels(locale).until} `}</span>
      {end ? <time dateTime={end}>{monthYear(end, locale)}</time> : present}
    </>
  );
}
