import { certificateGroups } from "@/lib/cv/certificateGroups";
import type { Certificate } from "@/lib/cv/data";

type Props = { certificates: readonly Certificate[] };

/** One line: "Instructeur (2024) en Hoofdanimator (2022) bij KLJ en de Vlaamse Overheid" */
export function Certificates({ certificates }: Props) {
  return (
    <p className="course">
      {certificateGroups(certificates).map((group, gi) => (
        <span key={group.issuer}>
          {gi > 0 && "; "}
          {group.certificates.map((c, i) => (
            <span key={c.name}>
              {i > 0 && " en "}
              <strong>{c.name}</strong> ({c.date.slice(0, 4)})
            </span>
          ))}
          {` bij ${group.issuer}`}
        </span>
      ))}
    </p>
  );
}
