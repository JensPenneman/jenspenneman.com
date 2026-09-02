/** "+32474180683" -> "+32 474 18 06 83" with non-breaking spaces (Belgian mobile grouping);
 * other numbers pass through. */
export function phoneDisplay(e164: string): string {
  const m = /^\+32(\d{3})(\d{2})(\d{2})(\d{2})$/.exec(e164);
  if (!m) return e164;
  const [, a, b, c, d] = m;
  const nbsp = "\u00a0";
  return a && b && c && d ? `+32${nbsp}${a}${nbsp}${b}${nbsp}${c}${nbsp}${d}` : e164;
}
