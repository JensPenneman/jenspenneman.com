import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/Header";
import { cvData } from "@/lib/cv/data";

vi.mock("@/assets/photo.jpg", () => ({ default: { src: "/photo.jpg", width: 708, height: 708 } }));

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
    expect(screen.getByRole("link", { name: "+32 474 18 06 83" })).toHaveAttribute(
      "href",
      `tel:${cvData.basics.phone}`,
    );
  });
  it("puts name and title in the single h1", () => {
    render(<Header basics={cvData.basics} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      `${cvData.basics.name}, ${cvData.basics.label}`,
    );
  });
});
