/* Build-time image variants (prebuild). The portrait renders at 85 design
 * units (115-153 CSS px), so a 708px JPEG is wasteful: emit 160px (1x) and
 * 320px (2x) squares as AVIF, WebP and JPEG into src/assets/generated/,
 * which Next imports as content-hashed, immutable assets. */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src/assets/photo.jpg");
const OUT = join(ROOT, "src/assets/generated");
mkdirSync(OUT, { recursive: true });

const SIZES = [160, 320];
for (const size of SIZES) {
  const base = sharp(SRC).resize(size, size, { fit: "cover" });
  await Promise.all([
    base
      .clone()
      .avif({ quality: 60 })
      .toFile(join(OUT, `photo-${size}.avif`)),
    base
      .clone()
      .webp({ quality: 80 })
      .toFile(join(OUT, `photo-${size}.webp`)),
    base
      .clone()
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(join(OUT, `photo-${size}.jpg`)),
  ]);
}
console.log(`images OK: ${SIZES.length * 3} variants in src/assets/generated/`);
