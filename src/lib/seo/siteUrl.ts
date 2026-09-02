import { cvData } from "@/lib/cv/data";

/** Canonical origin of the site; everything absolute derives from it. */
export const siteUrl = new URL(cvData.basics.url);
