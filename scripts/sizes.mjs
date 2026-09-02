/* First-load size report and budget for one exported page: every asset the
 * HTML references, with gzip and brotli sizes (Vercel serves brotli). Exits 1
 * when the critical-path total exceeds the budget. Usage: node scripts/sizes.mjs [locale] */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const OUT = fileURLToPath(new URL("../out", import.meta.url));
const locale = process.argv[2] ?? "nl-BE";
const BUDGET_BR = 12 * 1024; // critical path: html (+inlined css) + 1x avif + svg icon
const CRITICAL = /\.html$|photo-160\.[^.]+\.avif$|icon1\.svg$/;

const html = readFileSync(join(OUT, `${locale}.html`), "utf8");
const refs = [...html.matchAll(/(?:href|src|srcSet)="([^"]+)"/g)]
  .flatMap((m) => (m[1] ?? "").split(",").map((s) => s.trim().split(" ")[0] ?? ""))
  .filter((u) => u.startsWith("/") && !u.startsWith("//"))
  .map((u) => u.split("?")[0] ?? u);
const files = [`/${locale}.html`, ...new Set(refs)].filter((u) => {
  const p = join(OUT, u);
  return existsSync(p) && statSync(p).isFile();
});

const brotli = (/** @type {Buffer} */ b) =>
  brotliCompressSync(b, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;

let criticalBr = 0;
const pad = (/** @type {string | number} */ v, /** @type {number} */ n) => String(v).padStart(n);
console.log(
  `first load of /${locale}\n${"asset".padEnd(46)} ${pad("raw", 7)} ${pad("gzip", 7)} ${pad("brotli", 7)}`,
);
for (const u of files) {
  const buf = readFileSync(join(OUT, u));
  const br = brotli(buf);
  const critical = CRITICAL.test(u);
  if (critical) criticalBr += br;
  console.log(
    `${(critical ? "* " : "  ") + u.padEnd(44)} ${pad(buf.length, 7)} ${pad(gzipSync(buf).length, 7)} ${pad(br, 7)}`,
  );
}
console.log(`\n* critical path: ${criticalBr} bytes brotli (budget ${BUDGET_BR})`);
if (criticalBr > BUDGET_BR) {
  console.error("sizes: over budget");
  process.exit(1);
}
