import type { Language } from "./data";
import type { Pair } from "./pair";

export function languagePairs(languages: readonly Language[]): Pair[] {
  return languages.map((l) => ({ label: l.fluency, value: l.language }));
}
