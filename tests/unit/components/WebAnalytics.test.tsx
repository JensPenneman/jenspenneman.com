import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebAnalytics } from "@/components/WebAnalytics";

describe("WebAnalytics", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("renders nothing outside Vercel", () => {
    vi.stubEnv("VERCEL", "");
    const { container } = render(<WebAnalytics />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mounts the analytics component on Vercel", () => {
    vi.stubEnv("VERCEL", "1");
    expect(() => render(<WebAnalytics />)).not.toThrow();
  });
});
