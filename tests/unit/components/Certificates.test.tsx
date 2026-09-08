import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Certificates } from "@/components/Certificates";
import { cvData } from "@/lib/cv/data";
import { getLabels } from "@/lib/i18n/getLabels";

const L = (s: string) => ({ "nl-BE": s, "en-GB": s, "fr-BE": s, "de-BE": s });

describe("Certificates", () => {
  it("renders the CV's one-line certificate sentence in Dutch", () => {
    const { container } = render(
      <Certificates
        certificates={cvData.certificates}
        locale="nl-BE"
        labels={getLabels("nl-BE")}
      />,
    );
    expect(container.textContent).toBe(
      "Instructeur (2024) en Hoofdanimator (2022) uitgereikt door KLJ en de Vlaamse Overheid",
    );
    expect(container.querySelectorAll("strong")).toHaveLength(2);
  });
  it("localizes names, joiner and issuer", () => {
    const { container } = render(
      <Certificates
        certificates={cvData.certificates}
        locale="en-GB"
        labels={getLabels("en-GB")}
      />,
    );
    expect(container.textContent).toBe(
      "Instructor (2024) and Senior youth leader (2022) issued by KLJ and the Flemish Government",
    );
  });
  it("agrees the French participle and declines the German issuer", () => {
    const fr = render(
      <Certificates
        certificates={cvData.certificates}
        locale="fr-BE"
        labels={getLabels("fr-BE")}
      />,
    );
    expect(fr.container.textContent).toBe(
      "Instructeur (2024) et Animateur en chef (2022) délivrés par KLJ et le Gouvernement flamand",
    );
    const de = render(
      <Certificates
        certificates={cvData.certificates}
        locale="de-BE"
        labels={getLabels("de-BE")}
      />,
    );
    expect(de.container.textContent).toBe(
      "Instruktor (2024) und Hauptanimator (2022) von KLJ und der Flämischen Regierung",
    );
  });
  it("separates two issuers with the locale's list separator", () => {
    const certificates = [
      { name: L("A"), date: "2024-07", issuer: L("X") },
      { name: L("B"), date: "2022-07", issuer: L("Y") },
    ];
    const nl = render(
      <Certificates certificates={certificates} locale="nl-BE" labels={getLabels("nl-BE")} />,
    );
    expect(nl.container.textContent).toBe("A (2024) uitgereikt door X; B (2022) uitgereikt door Y");
    const fr = render(
      <Certificates certificates={certificates} locale="fr-BE" labels={getLabels("fr-BE")} />,
    );
    expect(fr.container.textContent).toBe("A (2024) délivré par X\u202f; B (2022) délivré par Y");
  });
});
