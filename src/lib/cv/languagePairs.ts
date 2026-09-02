import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import type { Language } from "./data";
import type { Pair } from "./pair";

export function languagePairs(languages: readonly Language[], locale: Locale): Pair[] {
  return languages.map((l) => ({ label: t(l.fluency, locale), value: t(l.language, locale) }));
}
