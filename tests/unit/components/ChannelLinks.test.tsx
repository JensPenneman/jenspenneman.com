import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChannelLinks } from "@/components/ChannelLinks";

describe("ChannelLinks", () => {
  it("renders labelled links that carry their URL for print", () => {
    const links = [
      { url: "https://a.test/", label: "Website" },
      { url: "https://b.test/", label: "GitHub" },
    ];
    render(<ChannelLinks links={links} />);
    const anchors = screen.getAllByRole("link");
    expect(anchors.map((a) => a.getAttribute("href"))).toEqual([
      "https://a.test/",
      "https://b.test/",
    ]);
    expect(anchors.map((a) => a.textContent)).toEqual(["Website", "GitHub"]);
    expect(anchors.map((a) => a.getAttribute("data-url"))).toEqual([
      "https://a.test/",
      "https://b.test/",
    ]);
  });
});
