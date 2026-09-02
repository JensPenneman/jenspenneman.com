import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Certificates } from "@/components/Certificates";
import { cvData } from "@/lib/cv/data";
import { getLabels } from "@/lib/i18n/getLabels";

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
      "Instructeur (2024) en Hoofdanimator (2022) bij KLJ en de Vlaamse Overheid",
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
      "Instructor (2024) and Senior youth leader (2022) at KLJ and the Flemish Government",
    );
  });
});
