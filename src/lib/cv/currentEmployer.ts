import type { Work } from "./data";

/** The open-ended (endDate null) position, if any. */
export function currentEmployer(work: readonly Work[]): Work | undefined {
  return work.find((w) => w.endDate === null);
}
