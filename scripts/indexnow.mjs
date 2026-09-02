/* Tells IndexNow-capable search engines (Bing, Yandex, Seznam, Naver; Bing
 * feeds DuckDuckGo) that the site's pages changed. The key is the 32-hex
 * public/<key>.txt file, which the engines fetch to verify ownership.
 * Usage: node scripts/indexnow.mjs   (after a production deployment) */
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HOST = "jenspenneman.com";
const LOCALES = ["nl-BE", "en-GB", "fr-BE", "de-BE"];

const key = readdirSync(`${ROOT}/public`)
  .map((f) => /^([0-9a-f]{32})\.txt$/.exec(f)?.[1])
  .find((k) => k !== undefined);
if (!key) throw new Error("no IndexNow key file in public/");

const body = {
  host: HOST,
  key,
  keyLocation: `https://${HOST}/${key}.txt`,
  urlList: LOCALES.map((l) => `https://${HOST}/${l}`),
};
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
console.log(`IndexNow: HTTP ${res.status} ${res.statusText} for ${body.urlList.length} URLs`);
if (res.status >= 400) process.exit(1);
