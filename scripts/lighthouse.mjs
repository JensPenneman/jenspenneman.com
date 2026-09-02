/* Lighthouse gate: starts `next start`, audits every locale (median of three
 * runs after a warm-up) and fails when a category drops below its floor. */
import { spawn } from "node:child_process";
import { get } from "node:http";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = 4174;
const RUNS = 3;
/** @type {readonly [string, ...string[]]} */
const LOCALES = ["nl-BE", "en-GB", "fr-BE", "de-BE"];
/** @type {Record<string, number>} */
const FLOORS = { performance: 0.95, accessibility: 1, "best-practices": 1, seo: 1 };

/** @param {string} locale */
const urlFor = (locale) => `http://127.0.0.1:${PORT}/${locale}`;

/** GET a URL and drain the body. @param {string} url @returns {Promise<number>} */
function fetchStatus(url) {
  return new Promise((resolve, reject) => {
    const req = get(url, (res) => {
      res.resume();
      res.once("end", () => resolve(res.statusCode ?? 0));
      res.once("error", reject);
    });
    req.once("error", reject);
  });
}

/** Wait until the server answers. @param {string} url */
async function waitFor(url) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetchStatus(url)) < 500) return;
    } catch {
      /* not listening yet */
    }
    await sleep(500);
  }
  throw new Error(`server did not start: ${url}`);
}

/** @param {number[]} values */
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? (sorted[mid] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/** One audit -> score per gated category (0-1).
 * @param {string} url @param {number} port @returns {Promise<Record<string, number>>} */
async function audit(url, port) {
  const result = await lighthouse(url, {
    port,
    output: "json",
    logLevel: "error",
    onlyCategories: Object.keys(FLOORS),
  });
  /** @type {Record<string, number>} */
  const scores = {};
  for (const [id, category] of Object.entries(result?.lhr.categories ?? {})) {
    scores[id] = category.score ?? 0;
  }
  return scores;
}

const server = spawn(
  process.execPath,
  [join(ROOT, "node_modules/next/dist/bin/next"), "start", "-p", String(PORT)],
  { cwd: ROOT, stdio: ["ignore", "ignore", "inherit"] },
);

let failed = false;
/** @type {import("chrome-launcher").LaunchedChrome | undefined} */
let chrome;
try {
  await waitFor(urlFor(LOCALES[0]));
  for (const locale of LOCALES) await fetchStatus(urlFor(locale));
  chrome = await launch({ chromeFlags: ["--headless=new"] });
  await audit(urlFor(LOCALES[0]), chrome.port); // absorbs Chrome start-up

  for (const locale of LOCALES) {
    /** @type {Record<string, number>[]} */
    const runs = [];
    for (let i = 0; i < RUNS; i++) runs.push(await audit(urlFor(locale), chrome.port));
    const line = Object.entries(FLOORS).map(([id, floor]) => {
      const values = runs.map((r) => r[id] ?? 0);
      const med = median(values);
      const min = Math.min(...values);
      const ok = med >= floor;
      if (!ok) failed = true;
      const extra = [
        Math.round(min * 100) !== Math.round(med * 100) ? `min ${Math.round(min * 100)}` : "",
        ok ? "" : `< ${floor * 100}`,
      ].filter(Boolean);
      return `${id} ${Math.round(med * 100)}${extra.length ? ` (${extra.join(", ")})` : ""}`;
    });
    console.log(`${locale}: ${line.join(" | ")}`);
  }
} finally {
  await chrome?.kill();
  server.kill();
  await sleep(100);
}
if (failed) {
  console.error("lighthouse: below floor");
  process.exit(1);
}
