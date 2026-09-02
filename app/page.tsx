import { Certificates } from "@/components/Certificates";
import { ChannelLinks } from "@/components/ChannelLinks";
import { Entry } from "@/components/Entry";
import { Header } from "@/components/Header";
import { HolidayJobs } from "@/components/HolidayJobs";
import { Pairs } from "@/components/Pairs";
import { Section } from "@/components/Section";
import { channels } from "@/lib/cv/channels";
import { cvData } from "@/lib/cv/data";
import { educationMeta } from "@/lib/cv/educationMeta";
import { languagePairs } from "@/lib/cv/languagePairs";
import { personaliaPairs } from "@/lib/cv/personaliaPairs";
import { skillPairs } from "@/lib/cv/skillPairs";
import { workMeta } from "@/lib/cv/workMeta";
import { LABELS } from "@/lib/labels";

export default function Page() {
  const { basics, work, holidayJobs, skills, education, certificates, languages } = cvData;
  return (
    <main className="stage">
      <article className="wrap">
        <div className="sheet">
          <Header basics={basics} />

          <Section id="personalia" heading={LABELS.personalia}>
            <Pairs pairs={personaliaPairs(basics)} twoCols />
          </Section>

          <Section id="werkervaring" heading={LABELS.work} contentClass="content jobs">
            {work.map((w) => (
              <Entry key={`${w.name}-${w.startDate}`} title={w.position} meta={workMeta(w)} />
            ))}
            <HolidayJobs jobs={holidayJobs} />
          </Section>

          <Section id="vaardigheden" heading={LABELS.skills}>
            <Pairs pairs={skillPairs(skills)} />
          </Section>

          <Section id="opleidingen" heading={LABELS.education} contentClass="content jobs opl">
            {education.map((e) => (
              <Entry
                key={`${e.institution}-${e.startDate}`}
                title={e.studyType}
                meta={educationMeta(e)}
              />
            ))}
          </Section>

          <Section id="cursussen" heading={LABELS.certificates}>
            <Certificates certificates={certificates} />
          </Section>

          <Section id="talen" heading={LABELS.languages}>
            <Pairs pairs={languagePairs(languages)} twoCols />
          </Section>

          <Section id="kanalen" heading={LABELS.channels}>
            <ChannelLinks urls={channels(basics)} />
          </Section>
        </div>
      </article>
    </main>
  );
}
