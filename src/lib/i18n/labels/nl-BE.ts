import { RANGE_DASH } from "@/lib/format/rangeDash";
import type { Labels } from "../labelsType";

export const labels: Labels = {
  language: "Taal",
  personalia: "Personalia",
  nationality: "Nationaliteit",
  license: "Rijbewijs",
  birthPlace: "Geboorteplaats",
  work: "Werkervaring",
  skills: "Vaardigheden",
  education: "Opleidingen",
  certificates: "Cursussen (geattesteerd)",
  languages: "Talen",
  channels: "Andere informatiekanalen",
  website: { label: "Website", owner: (name) => `van ${name}` },
  photoAlt: "Portretfoto van",
  present: "heden",
  until: "tot",
  and: "en",
  listSeparator: "; ",
  issuedBy: () => "uitgereikt door",
  holidayJobs: (count) => `+\u00a0${count} vakantiejobs`,
  workOrg: (company, city) => `bij ${company} te ${city}`,
  educationOrg: (institution) => `aan ${institution}`,
  holidayJobsMeta: (companies, startYear, endYear) =>
    `bij ${companies} ${startYear}${RANGE_DASH}${endYear}`,
  notFoundTitle: "Pagina niet gevonden",
  notFoundText: "Deze pagina bestaat niet.",
  notFoundBack: "Naar het CV",
};
