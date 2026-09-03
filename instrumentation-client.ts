import posthog from "posthog-js";

/* PostHog (EU cloud) through the same-origin reverse proxy in next.config.ts,
 * so the CSP keeps connect-src 'self' and ad blockers see nothing external.
 * Cookieless: memory persistence, no session recording, so no consent banner
 * is needed. No-op until NEXT_PUBLIC_POSTHOG_KEY is configured. */
const key = process.env["NEXT_PUBLIC_POSTHOG_KEY"];
if (key) {
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
}
