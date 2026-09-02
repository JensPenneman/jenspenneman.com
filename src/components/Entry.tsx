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
      <h3>{title}</h3>
      <p className="meta">
        {org}, <Period start={start} end={end} locale={locale} present={present} />
      </p>
    </div>
  );
}
