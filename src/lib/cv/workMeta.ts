import { period } from "@/lib/format/period";
import type { Work } from "./data";

/** "bij Advantitge te Deinze, Juli 2025 - heden" */
export function workMeta(work: Work): string {
  return `bij ${work.name} te ${work.location}, ${period(work.startDate, work.endDate)}`;
}
