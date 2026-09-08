import { inflateSync } from "node:zlib";

/* A minimal reader for the PDFs `page.pdf()` produces, so the print tests can
 * assert on what a reader actually gets. No dependency: Chromium writes plain
 * (uncompressed) object dictionaries and Flate-compressed streams, and
 * node:zlib inflates those.
 *
 * Text is stored as glyph ids, so it is decoded through each font's
 * /ToUnicode CMap -- per font, because two subsets reuse the same ids for
 * different characters. */

type Objects = ReadonlyMap<number, string>;

/** Every `N 0 obj … endobj` body, by object number. */
function parseObjects(pdf: string): Objects {
  const objects = new Map<number, string>();
  for (const [, number = "", body = ""] of pdf.matchAll(/(\d+)\s+0\s+obj\b([\s\S]*?)endobj/g)) {
    objects.set(Number(number), body);
  }
  return objects;
}

/** The object's stream, inflated when it is Flate-compressed. */
function streamOf(body: string): string {
  const marker = body.match(/stream\r?\n/);
  if (!marker || marker.index === undefined) return "";
  const start = marker.index + marker[0].length;
  const end = body.indexOf("endstream", start);
  if (end < 0) return "";
  const raw = Buffer.from(body.slice(start, end), "latin1");
  try {
    return inflateSync(raw).toString("latin1");
  } catch {
    return raw.toString("latin1");
  }
}

const fromCodePoints = (hex: string): string =>
  String.fromCharCode(...(hex.match(/.{4}/g) ?? []).map((h) => Number.parseInt(h, 16)));

/** glyph id (hex, upper case) -> the characters it stands for. */
function parseCMap(source: string): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const [, block = ""] of source.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const [, id = "", value = ""] of block.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      map.set(id.toUpperCase(), fromCodePoints(value));
    }
  }
  for (const [, block = ""] of source.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    const triples = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
    for (const [, lo = "", hi = "", first = ""] of block.matchAll(triples)) {
      const from = Number.parseInt(lo, 16);
      const to = Number.parseInt(hi, 16);
      const base = Number.parseInt(first, 16);
      for (let id = from; id <= to; id++) {
        map.set(
          id.toString(16).toUpperCase().padStart(lo.length, "0"),
          String.fromCharCode(base + id - from),
        );
      }
    }
  }
  return map;
}

/** Resource name (`F10`) -> that font's CMap. */
function parseFonts(objects: Objects): ReadonlyMap<string, ReadonlyMap<string, string>> {
  const fonts = new Map<string, ReadonlyMap<string, string>>();
  for (const body of objects.values()) {
    for (const [, dict = ""] of body.matchAll(/\/Font\s*<<([\s\S]*?)>>/g)) {
      for (const [, name = "", number = ""] of dict.matchAll(/\/(\w+)\s+(\d+)\s+0\s+R/g)) {
        const font = objects.get(Number(number)) ?? "";
        const toUnicode = font.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
        if (toUnicode?.[1])
          fonts.set(name, parseCMap(streamOf(objects.get(Number(toUnicode[1])) ?? "")));
      }
    }
  }
  return fonts;
}

/** The visible text of every page, in reading order, one text run per line. */
export function pdfText(pdf: Buffer): string {
  const source = pdf.toString("latin1");
  const objects = parseObjects(source);
  const fonts = parseFonts(objects);
  const empty: ReadonlyMap<string, string> = new Map();
  let text = "";
  for (const body of objects.values()) {
    if (!/\/Type\s*\/Page(?!s)/.test(body)) continue;
    const contents = body.match(/\/Contents\s+(\d+)\s+0\s+R/);
    if (!contents?.[1]) continue;
    let font = empty;
    const tokens = /\/(\w+)\s+[\d.]+\s+Tf|<([0-9A-Fa-f]+)>\s*Tj|(ET)/g;
    for (const [, name, glyph] of streamOf(objects.get(Number(contents[1])) ?? "").matchAll(
      tokens,
    )) {
      if (name !== undefined) font = fonts.get(name) ?? empty;
      else if (glyph !== undefined) text += font.get(glyph.toUpperCase()) ?? "�";
      else text += "\n";
    }
  }
  return text;
}

/** Every URL behind a link annotation, in document order. */
export function pdfLinkUris(pdf: Buffer): string[] {
  return [...pdf.toString("latin1").matchAll(/\/URI\s*\(([^)]*)\)/g)].map(([, uri = ""]) => uri);
}

/** How often `needle` occurs in `haystack`. */
export const occurrences = (haystack: string, needle: string): number =>
  haystack.split(needle).length - 1;
