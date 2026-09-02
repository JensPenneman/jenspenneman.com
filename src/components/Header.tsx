import { preload } from "react-dom";
import type { CvData } from "@/lib/cv/data";
import { photoSources } from "@/lib/cv/photoSources";
import { addressLine } from "@/lib/format/addressLine";
import { phoneDisplay } from "@/lib/format/phoneDisplay";
import type { Labels } from "@/lib/i18n/labelsType";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import { Separator } from "./Separator";

type Props = { basics: CvData["basics"]; locale: Locale; labels: Labels };

/** Photo, contact line, name + title, and the intro paragraph. */
export function Header({ basics, locale, labels }: Props) {
  const location = { ...basics.location, country: t(basics.location.country, locale) };
  /* The portrait is the LCP candidate: preload the AVIF (browsers without
   * AVIF ignore a preload whose type they don't support). */
  preload(photoSources.avif160, {
    as: "image",
    type: "image/avif",
    imageSrcSet: photoSources.avif,
    fetchPriority: "high",
  });
  return (
    <header className="row head">
      <div className="aside">
        <picture>
          <source type="image/avif" srcSet={photoSources.avif} />
          <source type="image/webp" srcSet={photoSources.webp} />
          <img
            className="photo"
            src={photoSources.jpg.src}
            srcSet={photoSources.jpg.srcSet}
            width={photoSources.jpg.width}
            height={photoSources.jpg.height}
            alt={`${labels.photoAlt} ${basics.name}`}
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className="content">
        <address className="contact">
          {addressLine(location)}
          <Separator />
          <a href={`mailto:${basics.email}`}>{basics.email}</a>
          <Separator />
          <a href={`tel:${basics.phone}`}>{phoneDisplay(basics.phone)}</a>
        </address>
        <h1>
          {basics.name}, {t(basics.label, locale)}
        </h1>
        <p className="intro">{t(basics.summary, locale)}</p>
      </div>
    </header>
  );
}
