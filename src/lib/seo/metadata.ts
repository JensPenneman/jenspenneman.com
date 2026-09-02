import type { Metadata } from "next";
import { cvData } from "@/lib/cv/data";
import { DEFAULT_LOCALE, LOCALES, type Locale, ogLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import { pageTitle } from "./pageTitle";
import { familyName, givenName } from "./personName";
import { siteUrl } from "./siteUrl";

/** Search-engine verification tokens, supplied through the environment. */
function verification(): Metadata["verification"] {
  const google = process.env["GOOGLE_SITE_VERIFICATION"];
  const bing = process.env["BING_SITE_VERIFICATION"];
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

export function buildMetadata(locale: Locale): Metadata {
  const title = pageTitle(locale);
  const description = t(cvData.basics.summary, locale);
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `/${l}`]));
  return {
    metadataBase: siteUrl,
    title,
    description,
    keywords: [
      cvData.basics.name,
      t(cvData.basics.label, locale),
      ...cvData.skills.flatMap((s) => s.keywords),
    ],
    authors: [{ name: cvData.basics.name, url: cvData.basics.url }],
    creator: cvData.basics.name,
    publisher: cvData.basics.name,
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, "x-default": `/${DEFAULT_LOCALE}` },
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
      siteName: title,
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
