type Props = { urls: readonly string[] };

/** Website and social profile links, URL shown as the link text. */
export function ChannelLinks({ urls }: Props) {
  return (
    <ul className="links">
      {urls.map((url) => (
        <li key={url}>
          <a href={url}>{url}</a>
        </li>
      ))}
    </ul>
  );
}
