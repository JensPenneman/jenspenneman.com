import type { Education } from "./data";

/** "bij Hogeschool Gent" */
export function educationOrg(education: Education): string {
  return `bij ${education.institution}`;
}
