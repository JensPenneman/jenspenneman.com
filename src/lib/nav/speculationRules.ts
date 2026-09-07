import { LOCALES, type Locale } from "@/lib/i18n/locales";

/** Speculation Rules for the language switcher, as the JSON body of a
 * `<script type="speculationrules">`.
 *
 * The switcher is four plain `<a href="/xx-YY">` links, so changing language
 * is a full document navigation. These rules let the browser fetch the other
 * three locales before the click lands, which turns the switch into a paint
 * rather than a round trip.
 *
 * Three deliberate choices:
 *
 *  - `prefetch`, not `prerender`. A prefetch stores the response and runs
 *    nothing from it; a prerender would execute the document, and neither
 *    PostHog nor Vercel Analytics is prerender-aware, so every hover would
 *    book a page view that never happened.
 *
 *  - `eagerness: "moderate"`, so a locale is fetched when the pointer rests
 *    on its link (or on pointerdown), not on load. Four speculative
 *    documents per visit would cost every reader three renders to save one.
 *
 *  - a document rule (`where`) rather than a `urls` list, even though the
 *    effect in Chromium is identical. WebKit acts on a `urls` list the
 *    moment it parses one -- eagerness and all -- and would fetch all three
 *    siblings on every page load; it leaves document rules alone. The
 *    condition still names the same three paths, so nothing else on the page
 *    (mailto:, tel:, the off-site profiles) is ever speculated.
 */
export function speculationRules(current: Locale): string {
  return JSON.stringify({
    prefetch: [
      {
        where: {
          href_matches: LOCALES.filter((locale) => locale !== current).map(
            (locale) => `/${locale}`,
          ),
        },
        eagerness: "moderate",
      },
    ],
  });
}
