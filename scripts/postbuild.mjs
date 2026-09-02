/* Post-build hardening for the static export.
 *
 * This page is pure content: no client components, no hydration, no
 * interactivity. So the Next.js runtime scripts in out/ are dead weight and
 * attack surface. This script:
 *   1. strips every executable <script> from the exported HTML (the JSON-LD
 *      data script is kept — it is never executed, it is data for crawlers);
 *   2. removes script preload hints;
 *   3. injects a strict Content-Security-Policy <meta> as the FIRST element
 *      of <head> (frame-ancestors etc. cannot live in a meta tag per spec —
 *      those are set as real HTTP headers in vercel.json at deploy time);
 *   4. deletes the now-unreferenced .js files from out/;
 *   5. fails the build if an executable script would survive.
 *
 * A nonce-based CSP is impossible on a static site (a nonce must be unique
 * per HTTP response); shipping zero executable scripts is strictly stronger.
 * When interactivity is ever added: delete this script from the build chain
 * and move to a hash- or nonce-based CSP on a server runtime.
 */
import { readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../out", import.meta.url));

const CSP = [
  "default-src 'none'",
  "img-src 'self'",
  "style-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const EXEC_SCRIPT = /<script(?![^>]*type="application\/ld\+json")[^>]*>[\s\S]*?<\/script>/g;
const SCRIPT_PRELOAD = /<link[^>]*\bas="script"[^>]*\/?>/g;

/**
 * @param {string} dir
 * @returns {Generator<string>}
 */
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

let htmlCount = 0;
let jsBytes = 0;
let jsCount = 0;

for (const file of walk(OUT)) {
  if (file.endsWith(".html")) {
    let html = readFileSync(file, "utf8");
    const before = html.length;
    html = html.replace(EXEC_SCRIPT, "").replace(SCRIPT_PRELOAD, "");
    html = html.replace(
      /<head>/,
      `<head><meta http-equiv="Content-Security-Policy" content="${CSP}"/>`,
    );

    if (/<script(?![^>]*application\/ld\+json)/.test(html)) {
      throw new Error(`executable <script> survived stripping in ${file}`);
    }
    if (!html.includes('http-equiv="Content-Security-Policy"')) {
      throw new Error(`CSP meta not injected in ${file}`);
    }
    writeFileSync(file, html);
    htmlCount++;
    console.log(`stripped ${file.slice(OUT.length + 1)} (${before} -> ${html.length} bytes)`);
  } else if (file.endsWith(".js")) {
    jsBytes += statSync(file).size;
    jsCount++;
    unlinkSync(file);
  }
}

const index = readFileSync(join(OUT, "index.html"), "utf8");
if (!index.includes("application/ld+json")) {
  throw new Error("JSON-LD script missing from index.html");
}

console.log(
  `postbuild OK: ${htmlCount} HTML files hardened, ${jsCount} JS files removed (${(jsBytes / 1024).toFixed(1)} KiB)`,
);
