import type { Labels } from "@/lib/i18n/labelsType";
import type { CvData } from "./data";

/** "bij Bpost, Storaenso, Houtshop Van der Gucht, V3 Consulting… 2017 - 2022" */
export function holidayJobsMeta(jobs: CvData["holidayJobs"], labels: Labels): string {
  const list = `${jobs.companies.join(", ")}${jobs.andMore ? "…" : ""}`;
  return labels.holidayJobsMeta(list, jobs.startYear, jobs.endYear);
}
