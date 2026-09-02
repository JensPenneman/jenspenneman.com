import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import type { Skill } from "./data";
import type { Pair } from "./pair";

export function skillPairs(skills: readonly Skill[], locale: Locale): Pair[] {
  return skills.map((s) => ({ label: t(s.name, locale), value: s.keywords.join(", ") }));
}
