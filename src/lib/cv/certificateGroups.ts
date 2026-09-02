import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import type { Certificate } from "./data";

export type CertificateGroup = { issuer: string; certificates: Certificate[] };

/** Groups certificates by (localized) issuer, preserving first-seen order. */
export function certificateGroups(
  certificates: readonly Certificate[],
  locale: Locale,
): CertificateGroup[] {
  const groups = new Map<string, Certificate[]>();
  for (const c of certificates) {
    const issuer = t(c.issuer, locale);
    const list = groups.get(issuer) ?? [];
    list.push(c);
    groups.set(issuer, list);
  }
  return [...groups].map(([issuer, certs]) => ({ issuer, certificates: certs }));
}
