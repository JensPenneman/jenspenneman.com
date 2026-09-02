import type { MetadataRoute } from "next";
import { cvData } from "@/lib/cv/data";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `CV ${cvData.basics.name}`,
    short_name: cvData.basics.name,
    description: t(cvData.basics.summary, DEFAULT_LOCALE),
    lang: DEFAULT_LOCALE,
    start_url: `/${DEFAULT_LOCALE}`,
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
