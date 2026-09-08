/** The "Other channels" links: the visible label of the personal-website row
 * plus the assistive-technology-only owner suffix every channel link carries
 * (WCAG 2.4.9 link purpose without touching the visible text). Both travel
 * together because the page hands this one value to `channelLinks`. */
export type WebsiteLabels = { label: string; owner: (name: string) => string };

/** Every UI string and composition template a locale must provide. */
export type Labels = {
  language: string;
  personalia: string;
  nationality: string;
  license: string;
  birthPlace: string;
  work: string;
  skills: string;
  education: string;
  certificates: string;
  languages: string;
  channels: string;
  website: WebsiteLabels;
  photoAlt: string;
  present: string;
  /** spoken (never shown) connective between the two ends of a date range */
  until: string;
  and: string;
  /** separates two certificate groups on the one-line certificate sentence */
  listSeparator: string;
  /** "uitgereikt door" — agrees with the number of certificates in French */
  issuedBy: (count: number) => string;
  holidayJobs: (count: number) => string;
  workOrg: (company: string, city: string) => string;
  /** `gender` is the grammatical gender of the institution name's head noun
   * ("m" | "f" | "n"), which German needs to pick "an der" over "am". */
  educationOrg: (institution: string, gender: string) => string;
  holidayJobsMeta: (companies: string, startYear: string, endYear: string) => string;
  notFoundTitle: string;
  notFoundText: string;
  notFoundBack: string;
};
