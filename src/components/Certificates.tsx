import { certificateGroups } from "@/lib/cv/certificateGroups";
import type { Certificate } from "@/lib/cv/data";
import type { Labels } from "@/lib/i18n/labelsType";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";

type Props = { certificates: readonly Certificate[]; locale: Locale; labels: Labels };

/** One line: "Instructeur (2024) en Hoofdanimator (2022) bij KLJ en de Vlaamse Overheid" */
export function Certificates({ certificates, locale, labels }: Props) {
  return (
    <p className="course">
      {certificateGroups(certificates, locale).map((group, gi) => (
        <span key={group.issuer}>
          {gi > 0 && "; "}
          {group.certificates.map((c, i) => (
            <span key={t(c.name, locale)}>
              {i > 0 && ` ${labels.and} `}
              <strong>{t(c.name, locale)}</strong> ({c.date.slice(0, 4)})
            </span>
          ))}
          {` ${labels.by} ${group.issuer}`}
        </span>
      ))}
    </p>
  );
}
