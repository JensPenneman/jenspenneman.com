import type { CvData } from "@/lib/cv/data";
import { holidayJobsMeta } from "@/lib/cv/holidayJobsMeta";
import { LABELS } from "@/lib/labels";

type Props = { jobs: CvData["holidayJobs"] };

/** Compact "+ N vakantiejobs" entry closing the work section. */
export function HolidayJobs({ jobs }: Props) {
  return (
    <div className="job vak">
      <p className="vaktitle">{`+ ${jobs.count} ${LABELS.holidayJobs}`}</p>
      <p className="meta">{holidayJobsMeta(jobs)}</p>
    </div>
  );
}
