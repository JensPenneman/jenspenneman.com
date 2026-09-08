/** The dash between the two ends of a date range: an en dash, the typographic
 * range dash in every language this CV speaks. A no-break space glues it to
 * the start, so a line never begins with the dash; the ordinary space after
 * it keeps the one break opportunity typography allows, so a wrapped range
 * continues cleanly on the next line ("september 2020 –" / "december 2023")
 * instead of carrying a leading space over. */
export const RANGE_DASH = "\u00a0\u2013 ";
