type Props = { data: object };

/** Structured data for crawlers. Never executed by the browser (data type). */
export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify output of build-time data; no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
