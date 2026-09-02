import photo from "@/assets/photo.jpg";
import type { CvData } from "@/lib/cv/data";
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
        {/* biome-ignore lint/performance/noImgElement: static export has no image optimizer; the asset is already sized and content-hashed */}
        <img
          className="photo"
          src={photo.src}
          alt={`${LABELS.photoAlt} ${basics.name}`}
          width={708}
          height={708}
        />
      </div>
      <div className="content">
        <p className="contact">
          {addressLine(basics.location)}
          <Separator />
          <a href={`mailto:${basics.email}`}>{basics.email}</a>
          <Separator />
          <a href={`tel:${basics.phone}`}>{phoneDisplay(basics.phone)}</a>
        </p>
        <h1>
          {basics.name}, {basics.label}
        </h1>
        <p className="intro">{basics.summary}</p>
      </div>
    </header>
  );
}
