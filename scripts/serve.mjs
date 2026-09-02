/* Zero-dependency static server for the exported site (preview + E2E).
 * Usage: node scripts/serve.mjs [port]   (default 4173) */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../out", import.meta.url));
const PORT = Number(process.argv[2] ?? 4173);

/** @type {Record<string, string>} */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

/** @param {string} urlPath */
function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0] ?? "/")).replace(
    /^(\.\.[/\\])+/,
    "",
  );
  const candidates = [join(OUT, clean), join(OUT, clean, "index.html"), `${join(OUT, clean)}.html`];
  return candidates.find((p) => existsSync(p) && statSync(p).isFile());
}

createServer((req, res) => {
  const file = resolve(req.url ?? "/");
  const status = file ? 200 : 404;
  const target = file ?? join(OUT, "404.html");
  res.writeHead(status, {
    "Content-Type": MIME[extname(target)] ?? "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  });
  createReadStream(target).pipe(res);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`serving ${OUT} at http://127.0.0.1:${PORT}/`);
});
