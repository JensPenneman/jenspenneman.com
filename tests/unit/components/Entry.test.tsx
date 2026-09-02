import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Entry } from "@/components/Entry";

describe("Entry", () => {
  it("renders a level-3 heading with a meta line", () => {
    render(<Entry title="Elektromechanica" meta="bij Broederschool Stekene" />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Elektromechanica");
    expect(screen.getByText("bij Broederschool Stekene")).toHaveClass("meta");
  });
});
