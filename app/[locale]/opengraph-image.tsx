import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { cvData } from "@/lib/cv/data";
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

/* Next probes metadata routes with placeholder params while collecting page
 * data, so resolve leniently; dynamicParams=false on the layout guarantees
 * only real locales are ever built. */
async function resolveLocale(params: Params["params"]): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

/* alt is a static export in this convention; the name is language-neutral. */
export const alt = cvData.basics.name;

const FONTS = join(process.cwd(), "src/assets/fonts");

/** Share card, generated at build from the data model. TeX Gyre Heros (a free
 * Helvetica clone) is used only here, at build time; nothing is shipped. */
export default async function OpenGraphImage({ params }: Params) {
  const locale = await resolveLocale(params);
  const [regular, bold, photo] = await Promise.all([
    readFile(join(FONTS, "texgyreheros-regular.otf")),
    readFile(join(FONTS, "texgyreheros-bold.otf")),
    readFile(join(process.cwd(), "src/assets/photo.jpg")),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: "0 96px",
        gap: 72,
        background: "linear-gradient(180deg, #f1f0f0 0%, #ebebec 20%, #f3f3f3 55%, #ffffff 100%)",
        fontFamily: "Heros",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: satori renders plain elements */}
      <img src={photoSrc} width={340} height={340} alt="" style={{ borderRadius: 170 }} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 84, fontWeight: 700, color: "#000000", letterSpacing: -1 }}>
          {cvData.basics.name}
        </div>
        <div style={{ fontSize: 42, color: "#555555", marginTop: 12 }}>
          {t(cvData.basics.label, locale)}
        </div>
        <div style={{ fontSize: 30, color: "#4a4a4a", marginTop: 56 }}>{siteUrl.host}</div>
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
}
