import type { Metadata } from "next";
import { cvData } from "@/lib/cv/data";
import { pageTitle } from "./pageTitle";
import { familyName, givenName } from "./personName";
import { siteUrl } from "./siteUrl";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: pageTitle,
  description: cvData.basics.summary,
  keywords: [cvData.basics.name, cvData.basics.label, ...cvData.skills.flatMap((s) => s.keywords)],
  authors: [{ name: cvData.basics.name, url: cvData.basics.url }],
  creator: cvData.basics.name,
  publisher: cvData.basics.name,
  alternates: { canonical: "/" },
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
    url: "/",
    siteName: pageTitle,
    locale: "nl_BE",
    title: pageTitle,
    description: cvData.basics.summary,
    firstName: givenName,
    lastName: familyName,
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: cvData.basics.summary,
  },
};
