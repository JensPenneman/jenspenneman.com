/* PostHog (EU cloud) through the same-origin reverse proxy in next.config.ts,
 * so the CSP keeps connect-src 'self' and ad blockers see nothing external.
 * Cookieless: memory persistence, no session recording, so no consent banner
 * is needed. No-op until NEXT_PUBLIC_POSTHOG_KEY is configured. */
const key = process.env["NEXT_PUBLIC_POSTHOG_KEY"];

/* Global Privacy Control: the reader's browser has declared that it does not
 * consent to being measured. The server already leaves the Vercel scripts out
 * of the document when the request carries `Sec-GPC: 1`; this is the same
 * refusal for the script that is already here. Checked before the idle
 * callback is even scheduled, so nothing is fetched, parsed or run. */
const gpc =
  (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

if (key && !gpc) {
  /* Analytics must never compete with the first paint of a CV.
   *
   * `import()` rather than a static import keeps the library in a chunk of
   * its own: ~270kB that used to sit in the document's first bundle, parsed
   * and evaluated before anything could be interactive, is now fetched only
   * when the browser has nothing better to do.
   *
   * `requestIdleCallback` is that "nothing better to do", and its `timeout`
   * is the promise that idle never becomes never: a main thread busy past
   * 2s runs the callback anyway, so the first page view is delayed but never
   * lost. `setTimeout` covers engines without requestIdleCallback. */
  const start = () => {
    void import("posthog-js").then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: "/pulse",
        ui_host: "https://eu.posthog.com",
        persistence: "memory",
        person_profiles: "identified_only",
        disable_session_recording: true,
        disable_surveys: true,
        capture_pageview: true,
        capture_pageleave: true,
        /* Everything below is a deliberate `false` rather than an omission.
         *
         * Each of these options defaults to `undefined`, which does not mean
         * "off": it means "ask the project's remote configuration", and the
         * answer arrives as extra JavaScript. On a four-page CV that bought
         * three bundles nobody asked for -- web vitals with attribution
         * (25.5 kB, measuring what Speed Insights already measures), dead
         * clicks (18.3 kB) and exception autocapture (13.6 kB) -- together
         * 41% of the bytes on the page. Stating the answer here means the
         * library never loads the code for a feature this site does not use.
         *
         * Exception autocapture is off with it: there is no error-tracking
         * workflow behind it, so it was collecting stack traces nobody read.
         *
         * `advanced_disable_flags` drops the /flags request as well. Feature
         * flags, experiments and surveys are all unused, and it is that
         * request which would otherwise re-enable the above remotely -- so
         * the two belong together: explicit config, no remote override. */
        capture_performance: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_heatmaps: false,
        autocapture: false,
        advanced_disable_flags: true,
      });
    });
  };
  if (typeof requestIdleCallback === "function") requestIdleCallback(start, { timeout: 2000 });
  else setTimeout(start, 1200);
}
