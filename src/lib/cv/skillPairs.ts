import type { Skill } from "./data";
import type { Pair } from "./pair";

export function skillPairs(skills: readonly Skill[]): Pair[] {
  return skills.map((s) => ({ label: s.name, value: s.keywords.join(", ") }));
}
