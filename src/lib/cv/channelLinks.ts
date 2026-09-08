import type { WebsiteLabels } from "@/lib/i18n/labelsType";
import type { CvData } from "./data";

export type ChannelLink = { url: string; label: string; owner: string };

/** Personal website first, then the social profiles, each with a human label
 * and the owner phrase assistive technology appends to it ("Website van Jens
 * Penneman"), so every link states its purpose on its own. */
export function channelLinks(basics: CvData["basics"], website: WebsiteLabels): ChannelLink[] {
  const owner = website.owner(basics.name);
  return [
    { url: basics.url, label: website.label, owner },
    ...basics.profiles.map((p) => ({ url: p.url, label: p.network, owner })),
  ];
}
