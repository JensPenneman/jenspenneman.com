import { RANGE_DASH } from "@/lib/format/rangeDash";
import type { Labels } from "../labelsType";

export const labels: Labels = {
  language: "Langue",
  personalia: "Données personnelles",
  nationality: "Nationalité",
  license: "Permis de conduire",
  birthPlace: "Lieu de naissance",
  work: "Expérience professionnelle",
  skills: "Compétences",
  education: "Formation",
  certificates: "Cours (certifiés)",
  languages: "Langues",
  channels: "Autres canaux",
  website: { label: "Site web", owner: (name) => `de ${name}` },
  photoAlt: "Photo portrait de",
  present: "aujourd’hui",
  until: "à",
  and: "et",
  /* the French semicolon takes a narrow no-break space in front of it
     (Lexique des règles typographiques en usage à l’Imprimerie nationale) */
  listSeparator: "\u202f; ",
  issuedBy: (count) => (count > 1 ? "délivrés par" : "délivré par"),
  holidayJobs: (count) => `+\u00a0${count} jobs d’étudiant`,
  workOrg: (company, city) => `chez ${company} à ${city}`,
  educationOrg: (institution) => `à ${institution}`,
  holidayJobsMeta: (companies, startYear, endYear) =>
    `chez ${companies} ${startYear}${RANGE_DASH}${endYear}`,
  notFoundTitle: "Page introuvable",
  notFoundText: "Cette page n’existe pas.",
  notFoundBack: "Retour au CV",
};
