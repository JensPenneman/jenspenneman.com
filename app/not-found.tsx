import { cvData } from "@/lib/cv/data";

export default function NotFound() {
  return (
    <main className="stage">
      <article className="wrap">
        <div className="sheet">
          <section className="row" aria-labelledby="nf">
            <h2 id="nf">404</h2>
            <div className="content">
              <h1>Pagina niet gevonden</h1>
              <p className="intro">
                Deze pagina bestaat niet. Het CV van {cvData.basics.name} staat op de startpagina.
              </p>
              <p className="back">
                <a href="/">Naar het CV</a>
              </p>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
