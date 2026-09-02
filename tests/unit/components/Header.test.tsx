import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/Header";
import { cvData } from "@/lib/cv/data";

vi.mock("@/lib/cv/photoSources", () => ({
  photoSources: {
    avif: "/p.avif 1x, /p2.avif 2x",
    webp: "/p.webp 1x, /p2.webp 2x",
    jpg: { src: "/p.jpg", srcSet: "/p.jpg 1x, /p2.jpg 2x", width: 160, height: 160 },
  },
}));

describe("Header", () => {
  it("shows the portrait with a descriptive alt text", () => {
    render(<Header basics={cvData.basics} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", `Portretfoto van ${cvData.basics.name}`);
  });
  it("links the email and phone number", () => {
    render(<Header basics={cvData.basics} />);
    expect(screen.getByRole("link", { name: cvData.basics.email })).toHaveAttribute(
      "href",
      `mailto:${cvData.basics.email}`,
    );
    expect(
      screen.getByRole("link", { name: "+32\u00a0474\u00a018\u00a006\u00a083" }),
    ).toHaveAttribute("href", `tel:${cvData.basics.phone}`);
  });
  it("puts name and title in the single h1", () => {
    render(<Header basics={cvData.basics} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      `${cvData.basics.name}, ${cvData.basics.label}`,
    );
  });
});
