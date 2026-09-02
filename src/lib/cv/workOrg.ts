import type { Work } from "./data";

/** "bij Advantitge te Deinze" */
export function workOrg(work: Work): string {
  return `bij ${work.name} te ${work.location}`;
}
