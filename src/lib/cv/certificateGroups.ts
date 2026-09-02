import type { Certificate } from "./data";

export type CertificateGroup = { issuer: string; certificates: Certificate[] };

/** Groups certificates by issuer, preserving first-seen issuer order. */
export function certificateGroups(certificates: readonly Certificate[]): CertificateGroup[] {
  const groups = new Map<string, Certificate[]>();
  for (const c of certificates) {
    const list = groups.get(c.issuer) ?? [];
    list.push(c);
    groups.set(c.issuer, list);
  }
  return [...groups].map(([issuer, certs]) => ({ issuer, certificates: certs }));
}
