import { dateNL } from "@/lib/format/dateNL";
import { LABELS } from "@/lib/labels";
import type { CvData } from "./data";
import type { Pair } from "./pair";

export function personaliaPairs(basics: CvData["basics"]): Pair[] {
  return [
    { label: LABELS.nationality, value: basics.nationality },
    { label: LABELS.license, value: basics.driversLicense.join(", ") },
    { label: LABELS.birthPlace, value: basics.birth.place },
    { label: LABELS.birthDate, value: dateNL(basics.birth.date) },
  ];
}
