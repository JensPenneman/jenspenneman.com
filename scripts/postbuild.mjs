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
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../out", import.meta.url));

/** @param {string[]} styleHashes sha256 sources for inlined stylesheets */
const buildCsp = (styleHashes) =>
  [
    "default-src 'none'",
    "img-src 'self'",
    `style-src 'self'${styleHashes.map((h) => ` '${h}'`).join("")}`,
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");

const STYLESHEET = /<link rel="stylesheet" href="(\/_next\/static\/[^"]+\.css)"[^>]*>/g;
const ROOT = fileURLToPath(new URL("..", import.meta.url));

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
/** @type {Set<string>} */
const styleHashes = new Set();
/** @type {Map<string, string>} */
const cssCache = new Map();

/** Inline every linked stylesheet (one fewer render-blocking round trip) and
 * record its CSP hash so `style-src` can stay free of 'unsafe-inline'.
 * @param {string} html */
function inlineStyles(html) {
  return html.replace(STYLESHEET, (_, href) => {
    const file = join(OUT, href);
    const css = cssCache.get(file) ?? readFileSync(file, "utf8").trim();
    cssCache.set(file, css);
    styleHashes.add(`sha256-${createHash("sha256").update(css).digest("base64")}`);
    return `<style>${css}</style>`;
  });
}

for (const file of walk(OUT)) {
  if (file.endsWith(".html")) {
    let html = readFileSync(file, "utf8");
    const before = html.length;
    html = inlineStyles(
      html
        .replace(EXEC_SCRIPT, "")
        .replace(SCRIPT_PRELOAD, "")
        .replace(/<div hidden=""><\/div>/g, ""),
    );
    const csp = buildCsp([...styleHashes]);
    html = html.replace(
      /<head>/,
      `<head><meta http-equiv="Content-Security-Policy" content="${csp}"/>`,
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

const DEFAULT_LOCALE = "nl-BE";
const LOCALES = ["nl-BE", "en-GB", "fr-BE", "de-BE"];
const index = readFileSync(join(OUT, `${DEFAULT_LOCALE}.html`), "utf8");
if (!index.includes("application/ld+json")) {
  throw new Error(`JSON-LD script missing from ${DEFAULT_LOCALE}.html`);
}

/* Root fallback: on Vercel, vercel.json redirects / by Accept-Language before
 * this file is ever served; elsewhere it forwards without JavaScript. */
const links = LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="/${l}">`).join("");
const list = LOCALES.map(
  (l) => `<li><a href="/${l}" hreflang="${l}" lang="${l}">${l}</a></li>`,
).join("");
writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html><html lang="${DEFAULT_LOCALE}"><head><meta http-equiv="Content-Security-Policy" content="${buildCsp([])}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=/${DEFAULT_LOCALE}"><title>CV</title>${links}<link rel="alternate" hreflang="x-default" href="/${DEFAULT_LOCALE}"></head><body><ul>${list}</ul></body></html>\n`,
);
console.log(`wrote root fallback index.html -> /${DEFAULT_LOCALE}`);

for (const file of cssCache.keys()) unlinkSync(file);

/* The HTTP header in vercel.json must carry the same hashes as the meta tag
 * (browsers intersect multiple policies). Sync it and remind to commit. */
const vercelPath = join(ROOT, "vercel.json");
const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
const headerCsp = `${buildCsp([...styleHashes])}; frame-ancestors 'none'; upgrade-insecure-requests`;
let vercelChanged = false;
for (const rule of vercel.headers ?? []) {
  for (const h of rule.headers ?? []) {
    if (h.key === "Content-Security-Policy" && h.value !== headerCsp) {
      h.value = headerCsp;
      vercelChanged = true;
    }
  }
}
if (vercelChanged) {
  writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);
  console.warn("vercel.json: Content-Security-Policy updated with the new style hash - commit it");
}

console.log(
  `postbuild OK: ${htmlCount} HTML files hardened, ${cssCache.size} stylesheet(s) inlined, ${jsCount} JS files removed (${(jsBytes / 1024).toFixed(1)} KiB)`,
);
