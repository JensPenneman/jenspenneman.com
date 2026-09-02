/* Presentation formatters: the JSON is a pure data model (ISO dates, E.164
 * phone, arrays); everything display-shaped is derived here. */

const LOCALE = "nl-BE";

export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** "2025-07" -> "Juli 2025" */
export function monthYear(iso: string): string {
  const [y = "", m = "1"] = iso.split("-");
  const month = new Intl.DateTimeFormat(LOCALE, { month: "long" }).format(
    new Date(Number(y), Number(m) - 1, 1),
  );
  return `${cap(month)} ${y}`;
}

/** "2025-07", null -> "Juli 2025 - heden" */
export function period(start: string, end: string | null): string {
  return `${monthYear(start)} - ${end ? monthYear(end) : "heden"}`;
}

/** "2002-11-23" -> "23/11/2002" */
export function dateNL(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE).format(new Date(iso));
}

/** "+32474180683" -> "+32 474 18 06 83" (Belgian mobile grouping) */
export function phoneDisplay(e164: string): string {
  const m = /^\+32(\d{3})(\d{2})(\d{2})(\d{2})$/.exec(e164);
  if (!m) return e164;
  const [, a, b, c, d] = m;
  return a && b && c && d ? `+32 ${a} ${b} ${c} ${d}` : e164;
}

export function addressLine(loc: {
  address: string;
  postalCode: string;
  city: string;
  country: string;
}): string {
  return `${loc.address}, ${loc.postalCode} ${loc.city}, ${loc.country}`;
}
