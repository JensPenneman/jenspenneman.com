import photo from "./photo.jpg";
import cv from "./cv.json";
import { addressLine, dateNL, period, phoneDisplay } from "./format";

/* All labels/headings are presentation, so they live here — the JSON stays a
 * pure data model. */
const LABELS = {
  personalia: "Personalia",
  nationality: "Nationaliteit",
  license: "Rijbewijs",
  birthPlace: "Geboorteplaats",
  birthDate: "Geboortedatum",
  work: "Werkervaring",
  holidayJobs: "vakantiejobs",
  skills: "Vaardigheden",
  education: "Opleidingen",
  certificates: "Cursussen (geattesteerd)",
  languages: "Talen",
  channels: "Andere informatiekanalen",
} as const;

type PairT = { label: string; value: string };

function Pairs({ pairs, twoCols = false }: { pairs: PairT[]; twoCols?: boolean }) {
  return (
    <dl className={twoCols ? "pairs cols2" : "pairs"}>
      {pairs.map((p) => (
        <div className="lr" key={p.label}>
          <dt>{p.label}</dt>
          <dd>{p.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Entry({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="job">
      <h3>{title}</h3>
      <p className="meta">{meta}</p>
    </div>
  );
}

function Section({
  id,
  heading,
  children,
  contentClass = "content",
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
  contentClass?: string;
}) {
  return (
    <section className="row" aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      <div className={contentClass}>{children}</div>
    </section>
  );
}

const Sep = () => <span aria-hidden="true">&nbsp;&nbsp;-&nbsp;&nbsp;</span>;

export default function Page() {
  const { basics, work, holidayJobs, skills, education, certificates, languages } = cv;

  const personalia: PairT[] = [
    { label: LABELS.nationality, value: basics.nationality },
    { label: LABELS.license, value: basics.driversLicense.join(", ") },
    { label: LABELS.birthPlace, value: basics.birth.place },
    { label: LABELS.birthDate, value: dateNL(basics.birth.date) },
  ];
  const skillPairs: PairT[] = skills.map((s) => ({ label: s.name, value: s.keywords.join(", ") }));
  const languagePairs: PairT[] = languages.map((l) => ({ label: l.fluency, value: l.language }));
  const channels: string[] = [basics.url, ...basics.profiles.map((p) => p.url)];
  const certIssuers = [...new Set(certificates.map((c) => c.issuer))];

  return (
    <main className="stage">
      <article className="wrap">
        <div className="sheet">
          <header className="row head">
            <div className="aside">
              <img
                className="photo"
                src={photo.src}
                alt={`Portretfoto van ${basics.name}`}
                width={708}
                height={708}
              />
            </div>
            <div className="content">
              <p className="contact">
                {addressLine(basics.location)}
                <Sep />
                <a href={`mailto:${basics.email}`}>{basics.email}</a>
                <Sep />
                <a href={`tel:${basics.phone}`}>{phoneDisplay(basics.phone)}</a>
              </p>
              <h1>
                {basics.name}, {basics.label}
              </h1>
              <p className="intro">{basics.summary}</p>
            </div>
          </header>

          <Section id="personalia" heading={LABELS.personalia}>
            <Pairs pairs={personalia} twoCols />
          </Section>

          <Section id="werkervaring" heading={LABELS.work} contentClass="content jobs">
            {work.map((w) => (
              <Entry
                key={w.name + w.startDate}
                title={w.position}
                meta={`bij ${w.name} te ${w.location}, ${period(w.startDate, w.endDate)}`}
              />
            ))}
            <div className="job vak">
              <p className="vaktitle">{`+ ${holidayJobs.count} ${LABELS.holidayJobs}`}</p>
              <p className="meta">
                {`bij ${holidayJobs.companies.join(", ")}${holidayJobs.andMore ? "…" : ""} ${holidayJobs.startYear} - ${holidayJobs.endYear}`}
              </p>
            </div>
          </Section>

          <Section id="vaardigheden" heading={LABELS.skills}>
            <Pairs pairs={skillPairs} />
          </Section>

          <Section id="opleidingen" heading={LABELS.education} contentClass="content jobs opl">
            {education.map((e) => (
              <Entry
                key={e.institution + e.startDate}
                title={e.studyType}
                meta={`bij ${e.institution}, ${period(e.startDate, e.endDate)}`}
              />
            ))}
          </Section>

          <Section id="cursussen" heading={LABELS.certificates}>
            <p className="course">
              {certIssuers.map((issuer, gi) => (
                <span key={issuer}>
                  {gi > 0 && "; "}
                  {certificates
                    .filter((c) => c.issuer === issuer)
                    .map((c, i) => (
                      <span key={c.name}>
                        {i > 0 && " en "}
                        <strong>{c.name}</strong> ({c.date.slice(0, 4)})
                      </span>
                    ))}
                  {` bij ${issuer}`}
                </span>
              ))}
            </p>
          </Section>

          <Section id="talen" heading={LABELS.languages}>
            <Pairs pairs={languagePairs} twoCols />
          </Section>

          <Section id="kanalen" heading={LABELS.channels}>
            <ul className="links">
              {channels.map((url) => (
                <li key={url}>
                  <a href={url}>{url}</a>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </article>
    </main>
  );
}
