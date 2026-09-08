import { cvData } from "@/lib/cv/data";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";

/** "Jens Penneman – Software engineer" (localized job title), name first and
 * an en dash between the two halves, as a title separator is set everywhere
 * this CV is read. */
export function pageTitle(locale: Locale): string {
  return `${cvData.basics.name} – ${t(cvData.basics.label, locale)}`;
}
