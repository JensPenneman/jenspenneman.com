import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";

const request = vi.hoisted(() => ({ headers: new Headers() }));
vi.mock("next/headers", () => ({ headers: () => Promise.resolve(request.headers) }));

/** The component is an async server component, so it is awaited into an
 * element tree and rendered to the markup a browser would actually receive. */
async function markup(): Promise<string> {
  const tree = await AnalyticsScripts();
  return tree === null ? "" : renderToStaticMarkup(tree);
}

describe("AnalyticsScripts", () => {
  beforeEach(() => {
    request.headers = new Headers({ "x-nonce": "r4nd0mnonce" });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("renders nothing outside Vercel, where neither script path exists", async () => {
    vi.stubEnv("VERCEL", "");
    expect(await markup()).toBe("");
  });

  it("renders the two Vercel scripts, deferred and same-origin", async () => {
    vi.stubEnv("VERCEL", "1");
    const html = await markup();
    expect(html).toContain('src="/_vercel/insights/script.js"');
    expect(html).toContain('src="/_vercel/speed-insights/script.js"');
    expect(html.match(/<script/g)).toHaveLength(2);
    expect(html.match(/defer/g)).toHaveLength(2);
  });

  it("carries the request nonce on both, so the CSP admits them", async () => {
    vi.stubEnv("VERCEL", "1");
    expect((await markup()).match(/nonce="r4nd0mnonce"/g)).toHaveLength(2);
  });

  it("adds no client component and no attribution telemetry", async () => {
    vi.stubEnv("VERCEL", "1");
    const html = await markup();
    expect(html).not.toContain("data-sdkn");
    expect(html).not.toContain("data-sdkv");
    expect(html).not.toContain("vercel-scripts.com");
  });

  it("leaves the scripts out entirely when the request carries Sec-GPC", async () => {
    vi.stubEnv("VERCEL", "1");
    request.headers = new Headers({ "x-nonce": "r4nd0mnonce", "sec-gpc": "1" });
    expect(await markup()).toBe("");
  });
});
