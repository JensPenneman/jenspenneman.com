import type { ChannelLink } from "@/lib/cv/channelLinks";

type Props = { links: readonly ChannelLink[] };

/** Website and social profile links. Screen shows the label; print shows the
 * URL (see .links a::after in the print stylesheet). */
export function ChannelLinks({ links }: Props) {
  return (
    <ul className="links">
      {links.map((l) => (
        <li key={l.url}>
          <a href={l.url} data-url={l.url}>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
