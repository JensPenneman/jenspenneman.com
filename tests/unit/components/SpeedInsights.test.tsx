import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SpeedInsights } from "@/components/SpeedInsights";

describe("SpeedInsights", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("renders nothing outside Vercel", () => {
    vi.stubEnv("VERCEL", "");
    const { container } = render(<SpeedInsights />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mounts the speed insights component on Vercel", () => {
    vi.stubEnv("VERCEL", "1");
    expect(() => render(<SpeedInsights />)).not.toThrow();
  });
});
