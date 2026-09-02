import { describe, expect, it } from "vitest";
import { cvData } from "@/lib/cv/data";
import { metadata } from "@/lib/seo/metadata";
import { pageTitle } from "@/lib/seo/pageTitle";

describe("metadata", () => {
  it("is anchored on the canonical site URL", () => {
    expect(String(metadata.metadataBase)).toBe(cvData.basics.url);
    expect(metadata.alternates).toEqual({ canonical: "/" });
  });
  it("uses the name-first title everywhere", () => {
    expect(metadata.title).toBe(pageTitle);
    expect(metadata.openGraph?.title).toBe(pageTitle);
    expect(metadata.twitter?.title).toBe(pageTitle);
  });
  it("asks search engines to index and follow", () => {
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });
  it("describes an Open Graph profile with a split name", () => {
    expect(metadata.openGraph).toMatchObject({
      type: "profile",
      firstName: "Jens",
      lastName: "Penneman",
    });
  });
});
