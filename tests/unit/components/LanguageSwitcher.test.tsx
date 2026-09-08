import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("links every locale and marks the current one", () => {
    render(<LanguageSwitcher current="fr-BE" label="Langue" />);
    const nav = screen.getByRole("navigation", { name: "Langue" });
    const links = [...nav.querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/nl-BE",
      "/en-GB",
      "/fr-BE",
      "/de-BE",
    ]);
    expect(links.map((a) => a.getAttribute("lang"))).toEqual(["nl-BE", "en-GB", "fr-BE", "de-BE"]);
    expect(links.map((a) => a.getAttribute("aria-current"))).toEqual([null, null, "page", null]);
  });

  it("shows the code and is named with the language's own name for itself", () => {
    render(<LanguageSwitcher current="nl-BE" label="Taal" />);
    const links = [...screen.getByRole("navigation").querySelectorAll("a")];
    /* visible: the two-letter code only */
    expect(links.map((a) => a.textContent)).toEqual(["NL", "EN", "FR", "DE"]);
    /* accessible name: the code first (WCAG 2.5.3), then the endonym as that
       language writes it -- French keeps "français" in lower case */
    expect(links.map((a) => a.getAttribute("aria-label"))).toEqual([
      "NL Nederlands",
      "EN English",
      "FR français",
      "DE Deutsch",
    ]);
    for (const name of ["NL Nederlands", "EN English", "FR français", "DE Deutsch"])
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
  });
});
