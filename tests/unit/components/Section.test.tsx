import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Section } from "@/components/Section";

describe("Section", () => {
  it("is a region landmark named by its heading", () => {
    render(
      <Section id="talen" heading="Talen">
        <p>inhoud</p>
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Talen" });
    expect(region).toHaveAttribute("aria-labelledby", "talen");
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "talen");
  });
});
