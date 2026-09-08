import { RANGE_DASH } from "@/lib/format/rangeDash";
import type { Labels } from "../labelsType";

export const labels: Labels = {
  language: "Language",
  personalia: "Personal details",
  nationality: "Nationality",
  license: "Driving licence",
  birthPlace: "Place of birth",
  work: "Work experience",
  skills: "Skills",
  education: "Education",
  certificates: "Courses (certified)",
  languages: "Languages",
  channels: "Other channels",
  website: { label: "Website", owner: (name) => `of ${name}` },
  photoAlt: "Portrait photo of",
  present: "present",
  until: "to",
  and: "and",
  listSeparator: "; ",
  issuedBy: () => "issued by",
  holidayJobs: (count) => `+\u00a0${count} holiday jobs`,
  workOrg: (company, city) => `at ${company} in ${city}`,
  educationOrg: (institution) => `at ${institution}`,
  holidayJobsMeta: (companies, startYear, endYear) =>
    `at ${companies} ${startYear}${RANGE_DASH}${endYear}`,
  notFoundTitle: "Page not found",
  notFoundText: "This page does not exist.",
  notFoundBack: "Back to the CV",
};
