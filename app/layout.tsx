import "@/styles/globals.css";
import photo from "@/assets/photo.jpg";
import { JsonLd } from "@/components/JsonLd";
import { cvData } from "@/lib/cv/data";
import { buildJsonLd } from "@/lib/seo/jsonLd";
import { metadata as seoMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/seo/siteUrl";
import { viewport as seoViewport } from "@/lib/seo/viewport";

export const metadata = seoMetadata;
export const viewport = seoViewport;

const jsonLd = buildJsonLd(cvData, new URL(photo.src, siteUrl), new Date(), siteUrl);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <JsonLd data={jsonLd} />
        {children}
      </body>
    </html>
  );
}
