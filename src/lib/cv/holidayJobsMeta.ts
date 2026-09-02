import type { CvData } from "./data";

/** "bij Bpost, Storaenso, Houtshop Van der Gucht, V3 Consulting… 2017 - 2022" */
export function holidayJobsMeta(jobs: CvData["holidayJobs"]): string {
  const more = jobs.andMore ? "…" : "";
  return `bij ${jobs.companies.join(", ")}${more} ${jobs.startYear} - ${jobs.endYear}`;
}
