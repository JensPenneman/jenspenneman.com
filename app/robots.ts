import type { MetadataRoute } from "next";
import cv from "./cv.json";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", cv.basics.url).href,
  };
}
