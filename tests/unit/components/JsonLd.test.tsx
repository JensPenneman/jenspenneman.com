import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "@/components/JsonLd";

describe("JsonLd", () => {
  it("emits a non-executable JSON-LD script that round-trips", () => {
    const data = { "@type": "Person", name: "Test" };
    const { container } = render(<JsonLd data={data} nonce="abc123" />);
    const script = container.querySelector("script");
    expect(script).toHaveAttribute("type", "application/ld+json");
    expect(script).toHaveAttribute("nonce", "abc123");
    expect(JSON.parse(script?.textContent ?? "")).toEqual(data);
  });
});
