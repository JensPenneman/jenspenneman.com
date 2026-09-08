/** Global Privacy Control (https://globalprivacycontrol.org): the reader's
 * browser states, in the request itself, that it does not consent to being
 * measured. Honouring it server-side costs no JavaScript at all -- the
 * measurement scripts are simply never written into the document.
 *
 * `1` is the only value the specification assigns a meaning; every other
 * value, and the absent header, mean "no signal". */
export function honoursGpc(header: string | null | undefined): boolean {
  return header === "1";
}
