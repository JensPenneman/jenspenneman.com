import type { MetadataRoute } from "next";
import { cvData } from "@/lib/cv/data";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `CV ${cvData.basics.name}`,
    short_name: cvData.basics.name,
    description: cvData.basics.summary,
    lang: "nl",
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
