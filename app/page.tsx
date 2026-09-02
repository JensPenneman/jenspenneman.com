import bg from "./bg.png";
import photo from "./photo.jpg";
import { cvHtml } from "./cv-markup";

export default function Page() {
  const html = cvHtml.replaceAll("__BG__", bg.src).replaceAll("__PHOTO__", photo.src);
  return (
    <main className="stage">
      <div className="paper">
        <div className="sheet" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
