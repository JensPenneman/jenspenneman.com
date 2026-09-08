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
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Elektromechanica");
    /* two entries can share a job title, so the heading names its
       organisation as well -- for assistive technology only */
    expect(heading).toHaveAccessibleName("Elektromechanica, bij Broederschool Stekene");
    expect(heading.querySelector(".vh")).toHaveTextContent(", bij Broederschool Stekene");
    const meta = document.querySelector(".meta") as HTMLElement;
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
    const meta = document.querySelector(".meta") as HTMLElement;
    expect(meta).toHaveTextContent("at Y in Z, July 2025 - present");
    expect(meta.querySelectorAll("time")).toHaveLength(1);
  });
});
