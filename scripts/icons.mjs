/* Re-encodes the committed PNG icons (apple-touch-icon, manifest icons) from
 * the portrait as palette PNGs, 3-4x smaller than plain PNG at these sizes.
 * Run manually when the photo changes (npm run icons) and commit the result;
 * it is deliberately not part of the build because libvips output is not
 * byte-identical across platforms. */
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src/assets/photo.jpg");

const ICONS = [
  { size: 180, path: join(ROOT, "app/apple-icon.png") },
  { size: 192, path: join(ROOT, "public/icons/icon-192.png") },
  { size: 512, path: join(ROOT, "public/icons/icon-512.png") },
];
for (const { size, path } of ICONS) {
  await sharp(SRC)
    .resize(size, size, { fit: "cover" })
    .png({ palette: true, quality: 80, compressionLevel: 9, effort: 10 })
    .toFile(path);
}
console.log(`icons OK: ${ICONS.length} PNGs re-encoded`);
