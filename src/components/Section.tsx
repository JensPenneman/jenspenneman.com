type Props = {
  id: string;
  heading: string;
  children: React.ReactNode;
  contentClass?: string;
};

/** A labelled landmark: gray heading in the gutter, content beside it. */
export function Section({ id, heading, children, contentClass = "content" }: Props) {
  return (
    <section className="row" aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      <div className={contentClass}>{children}</div>
    </section>
  );
}
