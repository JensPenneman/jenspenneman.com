import { notFound } from "next/navigation";
import { Certificates } from "@/components/Certificates";
import { ChannelLinks } from "@/components/ChannelLinks";
import { Entry } from "@/components/Entry";
import { Header } from "@/components/Header";
import { HolidayJobs } from "@/components/HolidayJobs";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Pairs } from "@/components/Pairs";
import { Section } from "@/components/Section";
import { channelLinks } from "@/lib/cv/channelLinks";
import { cvData } from "@/lib/cv/data";
import { educationOrg } from "@/lib/cv/educationOrg";
import { languagePairs } from "@/lib/cv/languagePairs";
import { personaliaPairs } from "@/lib/cv/personaliaPairs";
import { skillPairs } from "@/lib/cv/skillPairs";
import { workOrg } from "@/lib/cv/workOrg";
import { getLabels } from "@/lib/i18n/getLabels";
import { isLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";

type Params = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const labels = getLabels(locale);
  const { basics, work, holidayJobs, skills, education, certificates, languages } = cvData;
  return (
    <main className="stage">
      <article className="wrap">
        <div className="sheet">
          <LanguageSwitcher current={locale} label={labels.language} />
          <Header basics={basics} locale={locale} labels={labels} />

          <Section id="personalia" heading={labels.personalia}>
            <Pairs pairs={personaliaPairs(basics, locale, labels)} twoCols />
          </Section>

          <Section id="werkervaring" heading={labels.work} contentClass="content jobs">
            {work.map((w) => (
              <Entry
                key={`${w.name}-${w.startDate}`}
                title={t(w.position, locale)}
                org={workOrg(w, locale, labels)}
                start={w.startDate}
                end={w.endDate}
                locale={locale}
                present={labels.present}
              />
            ))}
            <HolidayJobs jobs={holidayJobs} labels={labels} />
          </Section>

          <Section id="vaardigheden" heading={labels.skills}>
            <Pairs pairs={skillPairs(skills, locale)} />
          </Section>

          <Section id="opleidingen" heading={labels.education} contentClass="content jobs opl">
            {education.map((e) => (
              <Entry
                key={`${e.institution}-${e.startDate}`}
                title={t(e.studyType, locale)}
                org={educationOrg(e, labels)}
                start={e.startDate}
                end={e.endDate}
                locale={locale}
                present={labels.present}
              />
            ))}
          </Section>

          <Section id="cursussen" heading={labels.certificates}>
            <Certificates certificates={certificates} locale={locale} labels={labels} />
          </Section>

          <Section id="talen" heading={labels.languages}>
            <Pairs pairs={languagePairs(languages, locale)} twoCols />
          </Section>

          <Section id="kanalen" heading={labels.channels}>
            <ChannelLinks links={channelLinks(basics, labels.website)} />
          </Section>
        </div>
      </article>
    </main>
  );
}
