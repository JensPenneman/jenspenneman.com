import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("links every locale and marks the current one", () => {
    render(<LanguageSwitcher current="fr-BE" label="Langue" />);
    const nav = screen.getByRole("navigation", { name: "Langue" });
    const links = nav.querySelectorAll("a");
    expect([...links].map((a) => a.getAttribute("href"))).toEqual([
      "/nl-BE",
      "/en-GB",
      "/fr-BE",
      "/de-BE",
    ]);
    expect([...links].map((a) => a.textContent)).toEqual(["NL", "EN", "FR", "DE"]);
    expect(screen.getByText("FR")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("NL")).not.toHaveAttribute("aria-current");
  });
});
