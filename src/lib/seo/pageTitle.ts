import { cvData } from "@/lib/cv/data";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";

/** "Jens Penneman - Software engineer" (localized job title) */
export function pageTitle(locale: Locale): string {
  return `${cvData.basics.name} - ${t(cvData.basics.label, locale)}`;
}
