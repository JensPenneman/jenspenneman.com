import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Entry } from "@/components/Entry";
import { RANGE_DASH } from "@/lib/format/rangeDash";

/** What a sighted reader sees: the DOM text minus the visually hidden parts. */
function visible(el: Element): string {
  const clone = el.cloneNode(true) as HTMLElement;
  for (const hidden of clone.querySelectorAll(".vh")) hidden.remove();
  return clone.textContent ?? "";
}

describe("Entry", () => {
  it("renders a level-3 heading with a meta line and machine-readable dates", () => {
    render(
      <Entry
        title="Elektromechanica"
        org="aan Broederschool Stekene"
        start="2016-09"
        end="2018-07"
        locale="nl-BE"
        present="heden"
      />,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Elektromechanica");
    const meta = screen.getByText(/aan Broederschool Stekene/);
    expect(visible(meta)).toBe(`aan Broederschool Stekene, september 2016${RANGE_DASH}juli 2018`);
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
    const meta = screen.getByText(/at Y in Z/);
    expect(visible(meta)).toBe(`at Y in Z, July 2025${RANGE_DASH}present`);
    expect(meta.querySelectorAll("time")).toHaveLength(1);
  });
});
