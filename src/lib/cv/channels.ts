import type { CvData } from "./data";

/** Personal website first, then the social profiles. */
export function channels(basics: CvData["basics"]): string[] {
  return [basics.url, ...basics.profiles.map((p) => p.url)];
}
