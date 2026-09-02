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
        locale="nl-BE"
        present="heden"
      />,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Elektromechanica");
    const meta = screen.getByText(/bij Broederschool Stekene/);
    expect(meta).toHaveTextContent("bij Broederschool Stekene, September 2016 - Juli 2018");
    expect(meta.querySelectorAll("time")).toHaveLength(2);
    expect(meta.querySelector("time")).toHaveAttribute("datetime", "2016-09");
  });
  it("renders an open end with the present word and a single time element", () => {
    render(
      <Entry
        title="X"
        org="at Y in Z"
        start="2025-07"
        end={null}
        locale="en-GB"
        present="present"
      />,
    );
    const meta = screen.getByText(/present/);
    expect(meta).toHaveTextContent("at Y in Z, July 2025 - present");
    expect(meta.querySelectorAll("time")).toHaveLength(1);
  });
});
