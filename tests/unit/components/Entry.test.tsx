import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Entry } from "@/components/Entry";

describe("Entry", () => {
  it("renders a level-3 heading with a meta line and machine-readable dates", () => {
    render(
      <Entry
        title="Elektromechanica"
        org="bij Broederschool Stekene"
        start="2016-09"
        end="2018-07"
      />,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Elektromechanica");
    const meta = screen.getByText(/bij Broederschool Stekene/);
    expect(meta).toHaveClass("meta");
    expect(meta).toHaveTextContent("bij Broederschool Stekene, September 2016 - Juli 2018");
    expect(meta.querySelectorAll("time")).toHaveLength(2);
    expect(meta.querySelector("time")).toHaveAttribute("datetime", "2016-09");
  });
  it("renders an open end as heden without a second time element", () => {
    render(<Entry title="X" org="bij Y te Z" start="2025-07" end={null} />);
    const meta = screen.getByText(/heden/);
    expect(meta.querySelectorAll("time")).toHaveLength(1);
  });
});
