import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChannelLinks } from "@/components/ChannelLinks";

describe("ChannelLinks", () => {
  it("renders each URL as a link whose text is the URL itself", () => {
    const urls = ["https://a.test/", "https://b.test/"];
    render(<ChannelLinks urls={urls} />);
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(urls);
    expect(links.map((l) => l.textContent)).toEqual(urls);
  });
});
