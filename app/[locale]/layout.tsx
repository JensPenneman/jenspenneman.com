import "@/styles/globals.css";
import "@/styles/platform.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import photo from "@/assets/photo.jpg";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { JsonLd } from "@/components/JsonLd";
import { cvData } from "@/lib/cv/data";
import { isLocale, LOCALES } from "@/lib/i18n/locales";
import { speculationRules } from "@/lib/nav/speculationRules";
import { buildJsonLd } from "@/lib/seo/jsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/seo/siteUrl";
import { viewport as seoViewport } from "@/lib/seo/viewport";

export const viewport = seoViewport;

type Params = { params: Promise<{ locale: string }> };

export const dynamicParams = false;

/* A cross-document view transition cross-fades the whole outgoing frame into
 * the incoming one, and the incoming document always starts at the top. From
 * any scrolled position the two frames therefore show unrelated parts of the
 * CV -- work experience fading into a portrait -- and the reader sees a
 * glitch rather than a change of language. The animation only tells the truth
 * at the top of the page, which is where the language switch lives, so
 * anywhere else the transition is skipped and the plain navigation happens
 * instead. `pageswap` is the last moment the outgoing document can decide. */
const SKIP_SCROLLED_TRANSITION =
  'addEventListener("pageswap",e=>{if(scrollY>0)e.viewTransition?.skipTransition()})';

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
  /* set per request by proxy.ts; reading it makes the page render per request */
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const jsonLd = buildJsonLd(cvData, locale, new URL(photo.src, siteUrl), siteUrl);
  return (
    <html lang={locale}>
      <body>
        <JsonLd data={jsonLd} nonce={nonce} />
        {/* Prefetch the sibling locales on hover; nonced like every other
            script, because CSP guards speculation rules through script-src. */}
        <script
          type="speculationrules"
          nonce={nonce}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify output of the static locale list; no user input
          dangerouslySetInnerHTML={{ __html: speculationRules(locale) }}
        />
        <script
          nonce={nonce}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: a module constant; no user input
          dangerouslySetInnerHTML={{ __html: SKIP_SCROLLED_TRANSITION }}
        />
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
