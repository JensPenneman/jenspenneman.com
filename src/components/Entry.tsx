import type { Locale } from "@/lib/i18n/locales";
import { Period } from "./Period";

type Props = {
  title: string;
  org: string;
  start: string;
  end: string | null;
  locale: Locale;
  present: string;
};

/** A work/education entry: bold title with a gray meta line beneath. */
export function Entry({ title, org, start, end, locale, present }: Props) {
  return (
    <div className="job">
      {/* Two entries share the title "Full stack software engineer"; heard on
          their own in a list of headings they are indistinguishable, so each
          heading names its organisation for assistive technology. It is the
          same string the meta line below repeats visually. */}
      <h3>
        {title}
        <span className="vh">, {org}</span>
      </h3>
      <p className="meta">
        {org}, <Period start={start} end={end} locale={locale} present={present} />
      </p>
    </div>
  );
}
