type Props = { title: string; meta: string };

/** A work/education entry: bold title with a gray meta line beneath. */
export function Entry({ title, meta }: Props) {
  return (
    <div className="job">
      <h3>{title}</h3>
      <p className="meta">{meta}</p>
    </div>
  );
}
