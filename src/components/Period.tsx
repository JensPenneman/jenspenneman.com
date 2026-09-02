import { monthYear } from "@/lib/format/monthYear";
import { PRESENT } from "@/lib/format/period";

type Props = { start: string; end: string | null };

/** "Juli 2025 - heden" with machine-readable <time> elements. */
export function Period({ start, end }: Props) {
  return (
    <>
      <time dateTime={start}>{monthYear(start)}</time>
      {" - "}
      {end ? <time dateTime={end}>{monthYear(end)}</time> : PRESENT}
    </>
  );
}
