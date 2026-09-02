import { dateLocal } from "@/lib/format/dateLocal";
import type { Labels } from "@/lib/i18n/labelsType";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import type { CvData } from "./data";
import type { Pair } from "./pair";

export function personaliaPairs(basics: CvData["basics"], locale: Locale, labels: Labels): Pair[] {
  return [
    { label: labels.nationality, value: t(basics.nationality, locale) },
    { label: labels.license, value: basics.driversLicense.join(", ") },
    { label: labels.birthPlace, value: basics.birth.place },
    { label: labels.birthDate, value: dateLocal(basics.birth.date, locale) },
  ];
}
