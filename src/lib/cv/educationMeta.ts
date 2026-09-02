import { period } from "@/lib/format/period";
import type { Education } from "./data";

/** "bij Hogeschool Gent, September 2020 - December 2023" */
export function educationMeta(education: Education): string {
  return `bij ${education.institution}, ${period(education.startDate, education.endDate)}`;
}
