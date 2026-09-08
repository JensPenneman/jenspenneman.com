import type { ChannelLink } from "@/lib/cv/channelLinks";

type Props = { links: readonly ChannelLink[] };

/** Website and social profile links. Screen shows the label; print shows the
 * URL (see .links a::after in the print stylesheet).
 *
 * "Website" and "GitHub" say nothing on their own, so each link carries an
 * assistive-technology-only owner phrase and is announced as "Website van
 * Jens Penneman" (WCAG 2.4.9), with the visible label unchanged (WCAG 2.5.3). */
export function ChannelLinks({ links }: Props) {
  return (
    <ul className="links">
      {links.map((l) => (
        <li key={l.url}>
          <a href={l.url} data-url={l.url}>
            {l.label}
            <span className="vh">{` ${l.owner}`}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
