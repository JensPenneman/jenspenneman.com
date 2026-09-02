import type { CvData } from "@/lib/cv/data";
import { photoSources } from "@/lib/cv/photoSources";
import { addressLine } from "@/lib/format/addressLine";
import { phoneDisplay } from "@/lib/format/phoneDisplay";
import { LABELS } from "@/lib/labels";
import { Separator } from "./Separator";

type Props = { basics: CvData["basics"] };

/** Photo, contact line, name + title, and the intro paragraph. */
export function Header({ basics }: Props) {
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
            alt={`${LABELS.photoAlt} ${basics.name}`}
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className="content">
        <address className="contact">
          {addressLine(basics.location)}
          <Separator />
          <a href={`mailto:${basics.email}`}>{basics.email}</a>
          <Separator />
          <a href={`tel:${basics.phone}`}>{phoneDisplay(basics.phone)}</a>
        </address>
        <h1>
          {basics.name}, {basics.label}
        </h1>
        <p className="intro">{basics.summary}</p>
      </div>
    </header>
  );
}
