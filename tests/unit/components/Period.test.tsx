import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Period } from "@/components/Period";
import { RANGE_DASH } from "@/lib/format/rangeDash";

/** What a sighted reader sees: the DOM text minus the visually hidden parts. */
function visible(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  for (const hidden of clone.querySelectorAll(".vh")) hidden.remove();
  return clone.textContent ?? "";
}

/** What a screen reader announces: the DOM text minus aria-hidden parts. */
function spoken(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  for (const hidden of clone.querySelectorAll("[aria-hidden='true']")) hidden.remove();
  return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("Period", () => {
  it("shows an en dash and speaks the locale's connective instead", () => {
    const { container } = render(
      <Period start="2024-07" end="2025-05" locale="nl-BE" present="heden" />,
    );
    expect(visible(container)).toBe(`juli 2024${RANGE_DASH}mei 2025`);
    expect(spoken(container)).toBe("juli 2024 tot mei 2025");
    expect(container.querySelectorAll("time")).toHaveLength(2);
    expect(container.querySelector("time")).toHaveAttribute("datetime", "2024-07");
  });
  it("speaks the open-ended range too, with one time element", () => {
    const { container } = render(
      <Period start="2025-07" end={null} locale="fr-BE" present="aujourd’hui" />,
    );
    expect(visible(container)).toBe(`juillet 2025${RANGE_DASH}aujourd’hui`);
    expect(spoken(container)).toBe("juillet 2025 à aujourd’hui");
    expect(container.querySelectorAll("time")).toHaveLength(1);
  });
  it("uses each locale's connective", () => {
    for (const [locale, word] of [
      ["en-GB", "to"],
      ["de-BE", "bis"],
    ] as const) {
      const { container } = render(
        <Period start="2020-09" end="2023-12" locale={locale} present="x" />,
      );
      expect(container.querySelector(".vh")?.textContent?.trim()).toBe(word);
    }
  });
});
