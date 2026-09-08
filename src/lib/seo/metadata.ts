import type { Metadata } from "next";
import { cvData } from "@/lib/cv/data";
import { LOCALES, type Locale, ogLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import { pageTitle } from "./pageTitle";
import { familyName, givenName } from "./personName";
import { siteUrl } from "./siteUrl";

/** Search-engine verification tokens, supplied through the environment. */
function verification(): Metadata["verification"] {
  const google = process.env["GOOGLE_SITE_VERIFICATION"];
  const yandex = process.env["YANDEX_VERIFICATION"];
  const bing = process.env["BING_SITE_VERIFICATION"];
  return {
    ...(google ? { google } : {}),
    ...(yandex ? { yandex } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

export function buildMetadata(locale: Locale): Metadata {
  const title = pageTitle(locale);
  /* the intro paragraph runs past what a search result shows; the data
     model carries its own short description for that. */
  const description = t(cvData.basics.metaDescription, locale);
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `/${l}`]));
  return {
    metadataBase: siteUrl,
    title,
    description,
    authors: [{ name: cvData.basics.name, url: cvData.basics.url }],
    creator: cvData.basics.name,
    publisher: cvData.basics.name,
    alternates: {
      canonical: `/${locale}`,
      /* x-default is the negotiating root, not a language: proxy.ts sends
         "/" to the best match for the reader's Accept-Language. */
      languages: { ...languages, "x-default": "/" },
    },
    verification: verification(),
    referrer: "strict-origin-when-cross-origin",
    formatDetection: { telephone: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "profile",
      url: `/${locale}`,
      siteName: siteUrl.host,
      locale: ogLocale(locale),
      alternateLocale: LOCALES.filter((l) => l !== locale).map(ogLocale),
      title,
      description,
      firstName: givenName,
      lastName: familyName,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
