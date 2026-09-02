import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pairs } from "@/components/Pairs";

describe("Pairs", () => {
  const pairs = [
    { label: "Frontend", value: "React" },
    { label: "Backend", value: "NodeJS" },
  ];
  it("renders a definition list with one term/definition per pair", () => {
    render(<Pairs pairs={pairs} />);
    expect(screen.getAllByRole("term")).toHaveLength(2);
    expect(screen.getAllByRole("definition").map((d) => d.textContent)).toEqual([
      "React",
      "NodeJS",
    ]);
  });
  it("toggles the two-column layout class", () => {
    const { container } = render(<Pairs pairs={pairs} twoCols />);
    expect(container.querySelector("dl")).toHaveClass("pairs", "cols2");
  });
});
