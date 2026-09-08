import type { MetadataRoute } from "next";
import { cvData } from "@/lib/cv/data";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import { familyName, givenName } from "@/lib/seo/personName";

export const dynamic = "force-static";

/** Web app manifest. Deliberately minimal: this is a CV, not an application,
 * so it declares an identity and an entry point and nothing else -- no
 * shortcuts, no screenshots, no share target, and `display: "browser"`
 * because an installed copy that hides the address bar would be a worse way
 * to read a CV than the tab it came from. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    /* `id` is what a user agent uses to recognise an already-installed copy;
       pinning it to the origin root keeps that identity stable no matter
       which locale the reader installed from. */
    id: "/",
    name: `CV ${cvData.basics.name}`,
    /* Home-screen label: 12 characters is where the platforms start to
       truncate, and the full name is 13. */
    short_name: `${givenName} ${familyName.slice(0, 1)}.`,
    description: t(cvData.basics.summary, DEFAULT_LOCALE),
    lang: DEFAULT_LOCALE,
    scope: "/",
    /* The origin root rather than a locale: it redirects (proxy.ts) to the
       language the reader's browser asks for, so an installed copy keeps
       negotiating instead of freezing one translation at install time. */
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
