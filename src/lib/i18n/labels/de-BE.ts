import { RANGE_DASH } from "@/lib/format/rangeDash";
import type { Labels } from "../labelsType";

export const labels: Labels = {
  language: "Sprache",
  personalia: "Persönliche Daten",
  nationality: "Staatsangehörigkeit",
  license: "Führerschein",
  birthPlace: "Geburtsort",
  work: "Berufserfahrung",
  skills: "Kenntnisse",
  education: "Ausbildung",
  certificates: "Kurse (zertifiziert)",
  languages: "Sprachen",
  channels: "Weitere Kanäle",
  website: { label: "Website", owner: (name) => `von ${name}` },
  photoAlt: "Porträtfoto von",
  present: "heute",
  until: "bis",
  and: "und",
  listSeparator: "; ",
  issuedBy: () => "von",
  holidayJobs: (count) => `+\u00a0${count} Ferienjobs`,
  workOrg: (company, city) => `bei ${company} in ${city}`,
  /* dative after "an": feminine "an der", masculine and neuter contract to "am" */
  educationOrg: (institution, gender) => `${gender === "f" ? "an der" : "am"} ${institution}`,
  holidayJobsMeta: (companies, startYear, endYear) =>
    `bei ${companies} ${startYear}${RANGE_DASH}${endYear}`,
  notFoundTitle: "Seite nicht gefunden",
  notFoundText: "Diese Seite existiert nicht.",
  notFoundBack: "Zurück zum Lebenslauf",
};
