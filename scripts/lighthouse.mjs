/* Lighthouse gate: serves the export over HTTPS, audits every locale and
 * fails when a category drops below its floor. SEO's floor is 0.9 because
 * Lighthouse fetches robots.txt from the page context, which the CSP
 * (default-src 'none') blocks; real crawlers are unaffected. */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const PORT = 4174;
const LOCALES = ["nl-BE", "en-GB", "fr-BE", "de-BE"];
/** @type {Record<string, number>} */
const FLOORS = { performance: 0.95, accessibility: 1, "best-practices": 1, seo: 0.9 };

const server = spawn(
  process.execPath,
  [fileURLToPath(new URL("./serve.mjs", import.meta.url)), String(PORT)],
  {
    stdio: ["ignore", "pipe", "inherit"],
  },
);
await new Promise((resolve) => server.stdout?.once("data", resolve));

const chrome = await launch({ chromeFlags: ["--headless=new", "--ignore-certificate-errors"] });
let failed = false;
try {
  for (const locale of LOCALES) {
    const result = await lighthouse(`https://127.0.0.1:${PORT}/${locale}`, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: Object.keys(FLOORS),
    });
    const categories = result?.lhr.categories ?? {};
    const line = Object.entries(FLOORS).map(([id, floor]) => {
      const score = categories[id]?.score ?? 0;
      const ok = score >= floor;
      if (!ok) failed = true;
      return `${id} ${Math.round(score * 100)}${ok ? "" : ` (< ${floor * 100})`}`;
    });
    console.log(`${locale}: ${line.join(" | ")}`);
  }
} finally {
  await chrome.kill();
  server.kill();
  await sleep(100);
}
if (failed) {
  console.error("lighthouse: below floor");
  process.exit(1);
}
