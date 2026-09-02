import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/Header";
import { cvData } from "@/lib/cv/data";
import { getLabels } from "@/lib/i18n/getLabels";

vi.mock("@/lib/cv/photoSources", () => ({
  photoSources: {
    avif160: "/p.avif",
    avif: "/p.avif 1x, /p2.avif 2x",
    webp: "/p.webp 1x, /p2.webp 2x",
    jpg: { src: "/p.jpg", srcSet: "/p.jpg 1x, /p2.jpg 2x", width: 160, height: 160 },
  },
}));

describe("Header", () => {
  it("shows the portrait with a descriptive alt text", () => {
    render(<Header basics={cvData.basics} locale="nl-BE" labels={getLabels("nl-BE")} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", `Portretfoto van ${cvData.basics.name}`);
  });
  it("links the email and phone number inside an address element", () => {
    render(<Header basics={cvData.basics} locale="nl-BE" labels={getLabels("nl-BE")} />);
    expect(screen.getByRole("link", { name: cvData.basics.email })).toHaveAttribute(
      "href",
      `mailto:${cvData.basics.email}`,
    );
    expect(screen.getByRole("link", { name: "+32 474 18 06 83" })).toHaveAttribute(
      "href",
      `tel:${cvData.basics.phone}`,
    );
    expect(document.querySelector("address")).toHaveTextContent(
      "Teerlingstraat 69/2, 9190 Stekene, België",
    );
  });
  it("puts the localized name and title in the single h1", () => {
    render(<Header basics={cvData.basics} locale="fr-BE" labels={getLabels("fr-BE")} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Jens Penneman, Ingénieur logiciel",
    );
    expect(document.querySelector("address")).toHaveTextContent("Belgique");
  });
});
