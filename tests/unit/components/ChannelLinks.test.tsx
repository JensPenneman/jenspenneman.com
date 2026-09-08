import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChannelLinks } from "@/components/ChannelLinks";

const links = [
  { url: "https://a.test/", label: "Website", owner: "van Jens Penneman" },
  { url: "https://b.test/", label: "GitHub", owner: "van Jens Penneman" },
];

describe("ChannelLinks", () => {
  it("renders labelled links that carry their URL for print", () => {
    render(<ChannelLinks links={links} />);
    const anchors = screen.getAllByRole("link");
    expect(anchors.map((a) => a.getAttribute("href"))).toEqual([
      "https://a.test/",
      "https://b.test/",
    ]);
    expect(anchors.map((a) => a.getAttribute("data-url"))).toEqual([
      "https://a.test/",
      "https://b.test/",
    ]);
  });

  it("keeps the visible label and states the link's purpose to assistive technology", () => {
    render(<ChannelLinks links={links} />);
    const anchors = screen.getAllByRole("link");
    expect(
      anchors.map((a) => {
        const clone = a.cloneNode(true) as HTMLElement;
        for (const hidden of clone.querySelectorAll(".vh")) hidden.remove();
        return clone.textContent;
      }),
    ).toEqual(["Website", "GitHub"]);
    expect(anchors.map((a) => a.textContent)).toEqual([
      "Website van Jens Penneman",
      "GitHub van Jens Penneman",
    ]);
  });
});
