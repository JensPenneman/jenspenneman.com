import type { CvData } from "./data";

export type ChannelLink = { url: string; label: string };

/** Personal website first, then the social profiles, each with a human label. */
export function channelLinks(basics: CvData["basics"], websiteLabel: string): ChannelLink[] {
  return [
    { url: basics.url, label: websiteLabel },
    ...basics.profiles.map((p) => ({ url: p.url, label: p.network })),
  ];
}
