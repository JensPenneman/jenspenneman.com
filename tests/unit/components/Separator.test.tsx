import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "@/components/Separator";

describe("Separator", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<Separator />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
