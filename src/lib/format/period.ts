import { monthYear } from "./monthYear";

export const PRESENT = "heden";

/** "2025-07", null -> "Juli 2025 - heden" */
export function period(start: string, end: string | null): string {
  return `${monthYear(start)} - ${end ? monthYear(end) : PRESENT}`;
}
