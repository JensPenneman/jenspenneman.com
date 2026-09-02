type Props = { data: object; nonce: string | undefined };

/** Structured data for crawlers. Never executed by the browser (data type). */
export function JsonLd({ data, nonce }: Props) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify output of build-time data; no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
