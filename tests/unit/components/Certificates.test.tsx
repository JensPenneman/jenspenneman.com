import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Certificates } from "@/components/Certificates";
import { cvData } from "@/lib/cv/data";

describe("Certificates", () => {
  it("renders the CV's one-line certificate sentence", () => {
    const { container } = render(<Certificates certificates={cvData.certificates} />);
    expect(container.textContent).toBe(
      "Instructeur (2024) en Hoofdanimator (2022) bij KLJ en de Vlaamse Overheid",
    );
    expect(container.querySelectorAll("strong")).toHaveLength(2);
  });
});
