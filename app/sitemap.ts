import type { MetadataRoute } from "next";
import { cvData } from "@/lib/cv/data";
import { LOCALES } from "@/lib/i18n/locales";
import { siteUrl } from "@/lib/seo/siteUrl";

export const dynamic = "force-static";

/* lastmod is the date the CV content changed (cv.json `updated`), not the
 * build date: a rebuild that changes nothing must not claim a fresh page.
 * changefreq and priority are omitted -- Google ignores both. x-default
 * points at the negotiating root, like the pages' own hreflang set. */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(LOCALES.map((l) => [l, new URL(`/${l}`, siteUrl).href])),
    "x-default": new URL("/", siteUrl).href,
  };
  return LOCALES.map((locale) => ({
    url: new URL(`/${locale}`, siteUrl).href,
    lastModified: cvData.updated,
    alternates: { languages },
  }));
}
