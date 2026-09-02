export type Location = { address: string; postalCode: string; city: string; country: string };

/** "Teerlingstraat 69/2, 9190 Stekene, België" */
export function addressLine(loc: Location): string {
  return `${loc.address}, ${loc.postalCode} ${loc.city}, ${loc.country}`;
}
