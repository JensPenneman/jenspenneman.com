import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/locales";
import { siteUrl } from "@/lib/seo/siteUrl";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, new URL(`/${l}`, siteUrl).href]));
  return LOCALES.map((locale) => ({
    url: new URL(`/${locale}`, siteUrl).href,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
