import type { CvData } from "@/lib/cv/data";
import { holidayJobsMeta } from "@/lib/cv/holidayJobsMeta";
import type { Labels } from "@/lib/i18n/labelsType";

type Props = { jobs: CvData["holidayJobs"]; labels: Labels };

/** Compact "+ N vakantiejobs" entry closing the work section. */
export function HolidayJobs({ jobs, labels }: Props) {
  return (
    <div className="job vak">
      {/* a heading, like every other entry in the section: `.vak .vaktitle`
          keeps the exact type it had as a paragraph */}
      <h3 className="vaktitle">{labels.holidayJobs(jobs.count)}</h3>
      <p className="meta">{holidayJobsMeta(jobs, labels)}</p>
    </div>
  );
}
