import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/siteUrl";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl.href, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
