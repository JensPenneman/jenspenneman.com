/* Lighthouse gate: serves the export over HTTPS, audits every locale and
 * fails when a category drops below its floor.
 *
 * Cold starts are the enemy of a hard floor: the very first audit also pays
 * for the TLS handshake, the first file reads, brotli compression and Chrome's
 * own warm-up, which on CI runners has cost ~25 performance points on whatever
 * URL happened to go first. So every URL is fetched once up front, one
 * throwaway audit is thrown at the first URL, and each URL is then measured
 * three times with the MEDIAN score per category driving the floor check. */
import { spawn } from "node:child_process";
import { get } from "node:https";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { localTrustAnchor } from "./localCert.mjs";

const PORT = 4174;
/** @type {readonly [string, ...string[]]} */
const LOCALES = ["nl-BE", "en-GB", "fr-BE", "de-BE"];
const RUNS = 3;
/** @type {Record<string, number>} */
const FLOORS = { performance: 0.95, accessibility: 1, "best-practices": 1, seo: 1 };

/** @param {string} locale */
const urlFor = (locale) => `https://127.0.0.1:${PORT}/${locale}`;
/* validate the preview certificate against its own trust anchor rather than
 * switching validation off */
const ca = localTrustAnchor();

/**
 * GET a URL over the local HTTPS cert and drain the body (the server is only
 * warm once it has actually read, compressed and written the file).
 * @param {string} url @returns {Promise<void>}
 */
function warmUp(url) {
  return new Promise((resolve, reject) => {
    const req = get(url, { ca }, (res) => {
      res.resume();
      res.once("end", () => resolve());
      res.once("error", reject);
    });
    req.once("error", reject);
  });
}

/**
 * One audit -> the score per gated category (0-1).
 * @param {string} url @param {number} port @returns {Promise<Record<string, number>>}
 */
async function audit(url, port) {
  const result = await lighthouse(url, {
    port,
    output: "json",
    logLevel: "error",
    onlyCategories: Object.keys(FLOORS),
  });
  const categories = result?.lhr.categories ?? {};
  /** @type {Record<string, number>} */
  const scores = {};
  for (const id of Object.keys(FLOORS)) scores[id] = categories[id]?.score ?? 0;
  return scores;
}

/** @param {readonly number[]} values */
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

const server = spawn(
  process.execPath,
  [fileURLToPath(new URL("./serve.mjs", import.meta.url)), String(PORT)],
  {
    stdio: ["ignore", "pipe", "inherit"],
  },
);
await new Promise((resolve) => server.stdout?.once("data", resolve));

let failed = false;
/** @type {import("chrome-launcher").LaunchedChrome | undefined} */
let chrome;
try {
  for (const locale of LOCALES) await warmUp(urlFor(locale));

  chrome = await launch({ chromeFlags: ["--headless=new", "--ignore-certificate-errors"] });
  await audit(urlFor(LOCALES[0]), chrome.port);

  for (const locale of LOCALES) {
    /** @type {Record<string, number>[]} */
    const runs = [];
    for (let i = 0; i < RUNS; i++) runs.push(await audit(urlFor(locale), chrome.port));

    const line = Object.entries(FLOORS).map(([id, floor]) => {
      const scores = runs.map((run) => run[id] ?? 0);
      const score = median(scores);
      const ok = score >= floor;
      if (!ok) failed = true;
      const percent = Math.round(score * 100);
      const low = Math.round(Math.min(...scores, score) * 100);
      const notes = [];
      if (low !== percent) notes.push(`min ${low}`);
      if (!ok) notes.push(`< ${floor * 100}`);
      return `${id} ${percent}${notes.length ? ` (${notes.join(", ")})` : ""}`;
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
