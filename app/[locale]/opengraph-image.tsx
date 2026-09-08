import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { cvData } from "@/lib/cv/data";
import { capitalize } from "@/lib/format/capitalize";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import { siteUrl } from "@/lib/seo/siteUrl";

type Params = { params: Promise<{ locale: string }> };

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/* A static export, so it cannot vary by locale; it describes what the card
 * shows rather than repeating the name a screen reader is about to read out
 * of the page anyway. */
export const alt = `Portrait, name and job title of ${cvData.basics.name}`;

/* Next probes metadata routes with placeholder params while collecting page
 * data, so resolve leniently; dynamicParams=false on the layout guarantees
 * only real locales are ever built. */
const FONTS = join(process.cwd(), "src/assets/fonts");

async function resolveLocale(params: Params["params"]): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

/** The language of this card, written the way that language writes it --
 * "Nederlands", "English", "français" -> "Français". Four cards that differ
 * only in a job title would otherwise be byte-identical for nl-BE and en-GB,
 * and a reader who is handed the wrong one has no way to tell. */
function endonym(locale: Locale): string {
  const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale.slice(0, 2));
  return capitalize(name ?? locale);
}

/** Share card, generated at build from the data model. TeX Gyre Heros (a free
 * Helvetica clone) is used only here, at build time; nothing is shipped.
 *
 * The geometry answers to two frames, not one. Most surfaces show the whole
 * 1200x630, but a square crop is common enough -- chat previews, link lists --
 * and it keeps only the middle 630x630, x from 285 to 915. So the portrait is
 * small enough, and the text column starts early enough, that the portrait
 * and the full name both survive that crop. The image never shrinks
 * (flexShrink 0) and the text column may (minWidth 0), which is what keeps a
 * long job title from pushing the name off the right-hand edge. */
export default async function OpenGraphImage({ params }: Params) {
  const locale = await resolveLocale(params);
  const [regular, bold, photo] = await Promise.all([
    readFile(join(FONTS, "texgyreheros-regular.otf")),
    readFile(join(FONTS, "texgyreheros-bold.otf")),
    readFile(join(process.cwd(), "src/assets/photo.jpg")),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  const image = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: "0 64px",
        gap: 48,
        position: "relative",
        background: "linear-gradient(180deg, #f1f0f0 0%, #ebebec 20%, #f3f3f3 55%, #ffffff 100%)",
        fontFamily: "Heros",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: satori renders plain elements */}
      <img
        src={photoSrc}
        width={260}
        height={260}
        alt=""
        style={{ borderRadius: 130, flexShrink: 0 }}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#000000", letterSpacing: -1 }}>
          {cvData.basics.name}
        </div>
        <div style={{ fontSize: 38, color: "#555555", marginTop: 12 }}>
          {t(cvData.basics.label, locale)}
        </div>
      </div>
      {/* Outside the square crop on purpose: the origin and the language of
          the card are what a reader can spare when the frame narrows to the
          identity, and down here they balance a composition that has to keep
          everything else left of centre. */}
      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 52,
          fontSize: 28,
          color: "#4a4a4a",
        }}
      >
        {`${siteUrl.host} · ${endonym(locale)}`}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Heros", data: regular, weight: 400, style: "normal" },
        { name: "Heros", data: bold, weight: 700, style: "normal" },
      ],
    },
  );

  /* Satori hands back a 32-bit RGBA PNG: 174 kB of truecolour for a flat
     gradient, a photograph and some black text. The card has nowhere near 128
     distinct colours once the gradient is dithered, so a palette re-encode is
     the same picture at a third of the bytes -- and this is the one image on
     the site that other people's servers fetch and cache on our behalf. */
  const quantised = await sharp(Buffer.from(await image.arrayBuffer()))
    .png({ palette: true, colours: 128, compressionLevel: 9, effort: 10 })
    .toBuffer();
  return new Response(new Uint8Array(quantised), {
    headers: { "Content-Type": contentType },
  });
}
