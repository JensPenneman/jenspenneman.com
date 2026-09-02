import type { Pair } from "@/lib/cv/pair";

type Props = { pairs: readonly Pair[]; twoCols?: boolean };

/** Definition list of leader-line rows: label ....... value */
export function Pairs({ pairs, twoCols = false }: Props) {
  return (
    <dl className={twoCols ? "pairs cols2" : "pairs"}>
      {pairs.map((p) => (
        <div className="lr" key={p.label}>
          <dt>{p.label}</dt>
          <dd>{p.value}</dd>
        </div>
      ))}
    </dl>
  );
}
