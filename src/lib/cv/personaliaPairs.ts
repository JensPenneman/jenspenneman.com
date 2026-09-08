import type { Labels } from "@/lib/i18n/labelsType";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import type { CvData } from "./data";
import type { Pair } from "./pair";

export function personaliaPairs(basics: CvData["basics"], locale: Locale, labels: Labels): Pair[] {
  /* "AM en B" / "AM and B" / "AM et B" / "AM und B" */
  const licences = new Intl.ListFormat(locale, { type: "conjunction" }).format(
    basics.driversLicense,
  );
  return [
    { label: labels.nationality, value: t(basics.nationality, locale) },
    { label: labels.license, value: licences },
    { label: labels.birthPlace, value: basics.birth.place },
  ];
}
