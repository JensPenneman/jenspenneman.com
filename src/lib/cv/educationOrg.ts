import type { Labels } from "@/lib/i18n/labelsType";
import type { Education } from "./data";

/** "aan Hogeschool Gent" / "at Hogeschool Gent" / "à Hogeschool Gent" /
 * "an der Hogeschool Gent" — a locative, never the employer preposition. */
export function educationOrg(education: Education, labels: Labels): string {
  return labels.educationOrg(education.institution, education.institutionGender);
}
