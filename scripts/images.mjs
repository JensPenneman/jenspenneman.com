/* Build-time image variants (prebuild). The portrait renders at 85 design
 * units (115-153 CSS px), so a 708px JPEG is wasteful: emit 160px (1x) and
 * 320px (2x) squares as AVIF, WebP and JPEG into public/img/ with a content
 * hash in the filename (immutable caching, no bundler involvement), and write
 * the resulting URLs to src/assets/generated/photo.json for the <picture>.
 * (The committed PNG icons are produced by scripts/icons.mjs, on purpose not
 * at build time: libvips output differs across platforms byte for byte.) */
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src/assets/photo.jpg");
const PUBLIC_DIR = join(ROOT, "public/img");
const MANIFEST_DIR = join(ROOT, "src/assets/generated");

rmSync(PUBLIC_DIR, { recursive: true, force: true });
mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(MANIFEST_DIR, { recursive: true });

const SIZES = /** @type {const} */ ([160, 320]);
const FORMATS = /** @type {const} */ (["avif", "webp", "jpg"]);

/** @type {Record<(typeof FORMATS)[number], Record<string, string>>} */
const manifest = { avif: {}, webp: {}, jpg: {} };

for (const size of SIZES) {
  const base = sharp(SRC).resize(size, size, { fit: "cover" });
  const encoded = {
    avif: await base.clone().avif({ quality: 60 }).toBuffer(),
    webp: await base.clone().webp({ quality: 80 }).toBuffer(),
    jpg: await base.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
  };
  for (const format of FORMATS) {
    const buf = encoded[format];
    const hash = createHash("sha256").update(buf).digest("base64url").slice(0, 10);
    const name = `photo-${size}.${hash}.${format}`;
    writeFileSync(join(PUBLIC_DIR, name), buf);
    manifest[format][String(size)] = `/img/${name}`;
  }
}
writeFileSync(join(MANIFEST_DIR, "photo.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `images OK: ${SIZES.length * FORMATS.length} variants in public/img/, manifest written`,
);
