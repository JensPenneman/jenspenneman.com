import { Certificates } from "@/components/Certificates";
import { ChannelLinks } from "@/components/ChannelLinks";
import { Entry } from "@/components/Entry";
import { Header } from "@/components/Header";
import { HolidayJobs } from "@/components/HolidayJobs";
import { Pairs } from "@/components/Pairs";
import { Section } from "@/components/Section";
import { channelLinks } from "@/lib/cv/channelLinks";
import { cvData } from "@/lib/cv/data";
import { educationOrg } from "@/lib/cv/educationOrg";
import { languagePairs } from "@/lib/cv/languagePairs";
import { personaliaPairs } from "@/lib/cv/personaliaPairs";
import { skillPairs } from "@/lib/cv/skillPairs";
import { workOrg } from "@/lib/cv/workOrg";
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
              <Entry
                key={`${w.name}-${w.startDate}`}
                title={w.position}
                org={workOrg(w)}
                start={w.startDate}
                end={w.endDate}
              />
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
                org={educationOrg(e)}
                start={e.startDate}
                end={e.endDate}
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
            <ChannelLinks links={channelLinks(basics, LABELS.website)} />
          </Section>
        </div>
      </article>
    </main>
  );
}
