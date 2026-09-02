import { Period } from "./Period";

type Props = { title: string; org: string; start: string; end: string | null };

/** A work/education entry: bold title with a gray meta line beneath. */
export function Entry({ title, org, start, end }: Props) {
  return (
    <div className="job">
      <h3>{title}</h3>
      <p className="meta">
        {org}, <Period start={start} end={end} />
      </p>
    </div>
  );
}
