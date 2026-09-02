import type { Labels } from "@/lib/i18n/labelsType";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import type { Work } from "./data";

/** "bij Advantitge te Deinze" / "at Advantitge in Deinze" / ... */
export function workOrg(work: Work, locale: Locale, labels: Labels): string {
  return labels.workOrg(work.name, t(work.location, locale));
}
