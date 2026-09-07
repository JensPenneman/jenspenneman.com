/* PostHog (EU cloud) through the same-origin reverse proxy in next.config.ts,
 * so the CSP keeps connect-src 'self' and ad blockers see nothing external.
 * Cookieless: memory persistence, no session recording, so no consent banner
 * is needed. No-op until NEXT_PUBLIC_POSTHOG_KEY is configured. */
const key = process.env["NEXT_PUBLIC_POSTHOG_KEY"];

if (key) {
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
      });
    });
  };
  if (typeof requestIdleCallback === "function") requestIdleCallback(start, { timeout: 2000 });
  else setTimeout(start, 1200);
}
