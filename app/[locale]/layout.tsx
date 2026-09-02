import "@/styles/globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import photo from "@/assets/photo.jpg";
import { JsonLd } from "@/components/JsonLd";
import { cvData } from "@/lib/cv/data";
import { isLocale, LOCALES } from "@/lib/i18n/locales";
import { buildJsonLd } from "@/lib/seo/jsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/seo/siteUrl";
import { viewport as seoViewport } from "@/lib/seo/viewport";

export const viewport = seoViewport;

type Params = { params: Promise<{ locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return buildMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: Params & { children: React.ReactNode }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const jsonLd = buildJsonLd(cvData, locale, new URL(photo.src, siteUrl), new Date(), siteUrl);
  return (
    <html lang={locale}>
      <body>
        <JsonLd data={jsonLd} />
        {children}
      </body>
    </html>
  );
}
