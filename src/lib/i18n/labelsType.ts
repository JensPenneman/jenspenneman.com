/** Every UI string and composition template a locale must provide. */
export type Labels = {
  language: string;
  personalia: string;
  nationality: string;
  license: string;
  birthPlace: string;
  birthDate: string;
  work: string;
  skills: string;
  education: string;
  certificates: string;
  languages: string;
  channels: string;
  website: string;
  photoAlt: string;
  present: string;
  and: string;
  by: string;
  holidayJobs: (count: number) => string;
  workOrg: (company: string, city: string) => string;
  educationOrg: (institution: string) => string;
  holidayJobsMeta: (companies: string, startYear: string, endYear: string) => string;
  notFoundTitle: string;
  notFoundText: string;
  notFoundBack: string;
};
