import type { Labels } from "@/lib/i18n/labelsType";
import type { Education } from "./data";

/** "bij Hogeschool Gent" / "at Hogeschool Gent" / ... */
export function educationOrg(education: Education, labels: Labels): string {
  return labels.educationOrg(education.institution);
}
