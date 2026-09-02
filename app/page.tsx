import photo from "./photo.jpg";

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="lr">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Job({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="job">
      <h3>{title}</h3>
      <p className="meta">{meta}</p>
    </div>
  );
}

export default function Page() {
  return (
    <main className="stage">
      <article className="wrap">
        <div className="sheet">
          <header className="row head">
            <div className="aside">
              <img className="photo" src={photo.src} alt="Portretfoto van Jens Penneman" width={708} height={708} />
            </div>
            <div className="content">
              <p className="contact">
                Teerlingstraat 69/2, 9190 Stekene, België&nbsp;&nbsp;-&nbsp;&nbsp;
                <a href="mailto:jenspenneman26@gmail.com">jenspenneman26@gmail.com</a>&nbsp;&nbsp;-&nbsp;&nbsp;
                <a href="tel:+32474180683">+32 474 18 06 83</a>
              </p>
              <h1>Jens Penneman, Software engineer</h1>
              <p className="intro">
                Full-stack software engineer met 4 jaar ervaring. Ik bouw dashboards, klantenportalen en
                koppelingen met externe diensten, van database tot pixel-perfecte interface.
              </p>
            </div>
          </header>

          <section className="row">
            <h2>Personalia</h2>
            <div className="content">
              <dl className="pairs cols2">
                <Pair label="Nationaliteit" value="Belg" />
                <Pair label="Rijbewijs" value="AM, B" />
                <Pair label="Geboorteplaats" value="Sint-Niklaas" />
                <Pair label="Geboortedatum" value="23/11/2002" />
              </dl>
            </div>
          </section>

          <section className="row">
            <h2>Werkervaring</h2>
            <div className="content jobs">
              <Job title="Full stack software engineer" meta="bij Advantitge te Deinze, Juli 2025 - heden" />
              <Job title="Full stack software engineer" meta="bij Lemon Companies te Kontich, Juli 2024 - Mei 2025" />
              <Job title="Student-zelfstandige" meta="bij WEB4YOU te Stekene, Oktober 2021 - Juni 2024" />
              <Job title="Stagiair front end engineer" meta="bij BASF te Gent, Oktober 2023 - December 2023" />
              <div className="job vak">
                <p className="vaktitle">+ 5 vakantiejobs</p>
                <p className="meta">bij Bpost, Storaenso, Houtshop Van der Gucht, V3 Consulting… 2017 - 2022</p>
              </div>
            </div>
          </section>

          <section className="row">
            <h2>Vaardigheden</h2>
            <div className="content">
              <dl className="pairs">
                <Pair label="Frontend" value="React, NextJS, TypeScript, Tailwind, TanStack Query" />
                <Pair label="Backend" value="NodeJS, GraphQL, Hasura, REST, PostgreSQL, Strapi" />
                <Pair label="Cloud en tooling" value="AWS, Vercel, Supabase, Sentry, Git, pnpm, Turborepo" />
              </dl>
            </div>
          </section>

          <section className="row">
            <h2>Opleidingen</h2>
            <div className="content jobs opl">
              <Job title="Toegepaste informatica" meta="bij Hogeschool Gent, September 2020 - December 2023" />
              <Job title="Industriële informatica & communicatietechnieken" meta="bij GTI Beveren, September 2018 - Juli 2020" />
              <Job title="Elektromechanica" meta="bij Broederschool Stekene, September 2016 - Juli 2018" />
            </div>
          </section>

          <section className="row">
            <h2>Cursussen (geattesteerd)</h2>
            <div className="content">
              <p className="course">
                <strong>Instructeur</strong> (2024) en <strong>Hoofdanimator</strong> (2022) bij KLJ en de Vlaamse
                Overheid
              </p>
            </div>
          </section>

          <section className="row">
            <h2>Talen</h2>
            <div className="content">
              <dl className="pairs cols2">
                <Pair label="Moedertaal" value="Nederlands" />
                <Pair label="Zeer goed" value="Engels" />
              </dl>
            </div>
          </section>

          <section className="row">
            <h2>Andere informatiekanalen</h2>
            <div className="content">
              <ul className="links">
                <li><a href="https://jenspenneman.com/">https://jenspenneman.com/</a></li>
                <li><a href="https://linkedin.com/in/jenspenneman/">https://linkedin.com/in/jenspenneman/</a></li>
                <li><a href="https://github.com/JensPenneman">https://github.com/JensPenneman</a></li>
              </ul>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
