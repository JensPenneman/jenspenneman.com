/** "+32474180683" -> "+32 474 18 06 83" (Belgian mobile grouping); other numbers pass through. */
export function phoneDisplay(e164: string): string {
  const m = /^\+32(\d{3})(\d{2})(\d{2})(\d{2})$/.exec(e164);
  if (!m) return e164;
  const [, a, b, c, d] = m;
  return a && b && c && d ? `+32 ${a} ${b} ${c} ${d}` : e164;
}
