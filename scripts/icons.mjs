/* Re-encodes the committed icons: the PNG app icons (apple-touch-icon,
 * manifest icons) from the portrait, and /favicon.ico from the JP monogram
 * that app/icon1.svg draws. Run manually when either source changes
 * (npm run icons) and commit the result; it is deliberately not part of the
 * build because libvips output is not byte-identical across platforms, and
 * because rasterising the monogram needs the system fonts the SVG names. */
import { Buffer } from "node:buffer";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src/assets/photo.jpg");
const MONOGRAM = join(ROOT, "app/icon1.svg");

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

/* ---------------------------------------------------------------------------
 * favicon.ico
 *
 * app/icon1.svg and app/icon0.png already give every browser that reads the
 * document a tab icon, but /favicon.ico is requested without asking the
 * document at all -- by feed readers, by crawlers, by anything working from
 * the well-known path -- and an origin that has no file there answers with
 * the 404 page: 5.6 kB of HTML pretending to be an image. A real icon is
 * smaller than the 404 it replaces.
 *
 * It lives in public/ rather than app/ on purpose. Next would emit a third
 * <link rel="icon"> for app/favicon.ico, which would make browsers that are
 * perfectly happy with the SVG fetch the ICO as well; from public/ it is
 * served to whoever guesses the path and ignored by everybody else.
 *
 * The container is assembled here because the alternative is a dependency
 * for 40 lines of struct writing. Each frame is a PNG rather than a DIB:
 * every engine released this decade reads PNG-in-ICO, and the three DIB
 * frames with their AND masks would be 15 kB against 1.5 kB.
 * ------------------------------------------------------------------------ */
const ICO_SIZES = /** @type {const} */ ([16, 32, 48]);
const MASTER = 192; /* 4x the largest frame */
const HEADER = 6;
const ENTRY = 16;

/* Rasterise the monogram once, large, then let the resizer antialias down:
   librsvg's own hinting at 16px turns the two letters to mud. */
const master = await sharp(MONOGRAM, { density: 72 * 8 })
  .resize(MASTER, MASTER, { fit: "contain" })
  .png()
  .toBuffer();

const frames = await Promise.all(
  ICO_SIZES.map(async (size) => ({
    size,
    png: await sharp(master)
      .resize(size, size, { fit: "contain" })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  })),
);

const directory = Buffer.alloc(HEADER + ENTRY * frames.length);
directory.writeUInt16LE(0, 0); /* reserved */
directory.writeUInt16LE(1, 2); /* 1 = icon (2 would be a cursor) */
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
frames.forEach(({ size, png }, index) => {
  const at = HEADER + ENTRY * index;
  directory.writeUInt8(size, at); /* width; 0 would mean 256 */
  directory.writeUInt8(size, at + 1); /* height */
  directory.writeUInt8(0, at + 2); /* palette entries: 0 = not paletted */
  directory.writeUInt8(0, at + 3); /* reserved */
  directory.writeUInt16LE(1, at + 4); /* colour planes */
  directory.writeUInt16LE(32, at + 6); /* bits per pixel */
  directory.writeUInt32LE(png.length, at + 8);
  directory.writeUInt32LE(offset, at + 12);
  offset += png.length;
});
const ico = Buffer.concat([directory, ...frames.map(({ png }) => png)]);
writeFileSync(join(ROOT, "public/favicon.ico"), ico);

console.log(
  `icons OK: ${ICONS.length} PNGs re-encoded, favicon.ico with ${frames.length} frames (${ico.length} bytes)`,
);
