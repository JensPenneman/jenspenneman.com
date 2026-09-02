import type { CvData } from "@/lib/cv/data";
import { holidayJobsMeta } from "@/lib/cv/holidayJobsMeta";
import type { Labels } from "@/lib/i18n/labelsType";

type Props = { jobs: CvData["holidayJobs"]; labels: Labels };

/** Compact "+ N vakantiejobs" entry closing the work section. */
export function HolidayJobs({ jobs, labels }: Props) {
  return (
    <div className="job vak">
      <p className="vaktitle">{labels.holidayJobs(jobs.count)}</p>
      <p className="meta">{holidayJobsMeta(jobs, labels)}</p>
    </div>
  );
}
