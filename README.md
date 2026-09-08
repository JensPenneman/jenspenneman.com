# cv-site

Jens's CV as a data-driven Next.js app on Vercel (npm, Node LTS via `.nvmrc`).

## Layout

```
app/            Next App Router: routes + metadata file conventions only
  [locale]/     root layout (html lang, JSON-LD, metadata), page, build-time OG card
  global-not-found.tsx  404 in the CV design with a link per language
  llms.txt/route.ts     llmstxt.org summary, generated from the data model
  sitemap.ts robots.ts manifest.ts icon0.png icon1.svg apple-icon.png
src/
  assets/       photo.jpg + the build-time OG card fonts
  components/   one component per file (Header, Section, Pairs, Entry, ...)
  content/      cv.json (the data model) + cv.schema.json
  lib/cv/       typed data access + view-model derivations (one function per file)
  lib/format/   Intl-based, locale-aware formatters (one per file)
  lib/i18n/     locales, localized-string helper, labels + templates per locale
  lib/nav/      the speculation-rules document rule
  lib/seo/      metadata, viewport, JSON-LD builder, site URL, page title
  styles/       globals.css (the design) + platform.css (the platform
                behaviours: bfcache, view transitions, safe areas, scrolling)
scripts/        images (prebuild), icons (manual), hooks (local git hooks),
                lighthouse (score gate), indexnow (search-engine ping)
proxy.ts        per-request nonce CSP, Accept-Language negotiation, 404 rewrite
tests/unit/     Vitest: formatters, i18n, data-model rules, SEO, components
tests/e2e/      Playwright: a11y, bfcache, content, layout, platform, print,
                security (+ pdfText.ts, a dependency-free reader for the
                printed PDF)
tests/visual/   Playwright screenshot baselines (macOS)
```

House rule: **one file = one purpose.** No multi-component files, no barrels.

## Languages

Four locales at BCP 47 paths: `/nl-BE` (default), `/en-GB`, `/fr-BE`, `/de-BE`.
Each page carries its own `lang`, title/description, canonical, `hreflang`
alternates (+ `x-default`), `og:locale`, JSON-LD `inLanguage` and sitemap
alternates. The root `/` is negotiated from `Accept-Language` (q-values honoured) in
`proxy.ts`, which redirects to the best locale with `Vary: Accept-Language`.
UI strings and composition templates live in `src/lib/i18n/labels/<locale>.ts`.

## Editing the CV

All content lives in [src/content/cv.json](src/content/cv.json) — a pure data
model (ISO dates, E.164 phone, arrays; human-language fields are objects with
all four locales) validated by
[src/content/cv.schema.json](src/content/cv.schema.json) (`$schema` gives editor
autocomplete + validation; the unit tests validate it too). The UI derives every
display string (`src/lib/format`, `src/lib/cv`): Dutch month names via `Intl`,
"bij X te Y" composition, list joining, phone grouping. Labels/headings are
presentation and live in `src/lib/i18n/labels/<locale>.ts`.

## Design

- One design unit `--pt` in [src/styles/globals.css](src/styles/globals.css);
  the numbers in `calc(var(--pt) * N)` are the print master's point values.
- Screen is a fluid webpage (rem unit, em media queries — browser zoom and
  user font-size settings scale everything coherently): mobile < 40em stacked,
  tablet 40-64em narrow gutter, desktop, big >= 100em.
- Phones get their own composition on one vertical-rhythm scale (`--sp-1..4`,
  derived from `--pt`): label-over-value pairs instead of leader lines, tracked uppercase
  section labels over a hairline (`--rule`, defined for every color mode), 44px
  contact/link rows, `hyphens: auto` so nothing overflows at 320px with 200% text.
- Every row's text sits on its own text line: the 44px hit areas (WCAG 2.5.5)
  belong to the links themselves and grow symmetrically around the text
  (`--target`, `--target-pad`), so the first line of every section aligns with
  its label within 1px at every width — asserted by `tests/e2e/layout.spec.ts`.
  Language-switcher links are 44×44 targets of their own.
- Section labels are sticky (screen only): each pins to the top while its own
  section scrolls past, on the page ground in every color mode, with a hairline
  that appears only while stuck (`@container scroll-state(stuck: top)`,
  progressive) and `scroll-padding-top` so focus never lands under a label.
- Print (`--pt: 1pt`) reproduces the exact CV on A4 via the native browser
  print action, gradient wash included — verified against the PDF master.
- Colors authored in HCL (CSS `lch()`, gradients `in lch`), sRGB fallbacks.
- WCAG 2.2 AAA on screen (axe-audited in E2E, every level tag up to and
  including `wcag22aaa`, plus axe's best practices): >= 7:1 contrast, 1.5 line
  spacing + no justification for paragraphs, >= 44px link targets, focus
  outlines, landmarks (`section[aria-labelledby]`), `dl` semantics, h1-h3.
- Follows the system on screen only (print is always the light master):
  dark mode (`prefers-color-scheme`), increased contrast (`prefers-contrast:
  more` — >= 15:1 inks, heavier leader lines, underlined links, thicker focus
  ring, light and dark variants) and Windows Contrast Themes
  (`forced-colors: active` — system-color roles, structure carried by borders
  and underlines). Light, dark and both increased-contrast variants are
  axe-audited in E2E, at 412, 768, 1280 and 1920px, on the CV pages and on the
  404; forced colors is asserted structurally instead, because the colours
  there are the operating system's and axe would be auditing the OS theme.

## SEO

Full metadata from the data model, per locale: title/description/keywords,
canonical + hreflang, robots (+googleBot), Open Graph `profile` with a
**build-time generated 1200x630 card** (`app/[locale]/opengraph-image.tsx`,
rendered with TeX Gyre Heros — a free Helvetica clone used only at build time),
Twitter card, icons, `manifest.webmanifest`, `sitemap.xml`, `robots.txt`,
JSON-LD `ProfilePage`/`Person`. Search engines: `npm run indexnow` pings
Bing/Yandex/Seznam/Naver (IndexNow; key file in public/) after a production
deploy; Google only takes the sitemap via Search Console. Verification tokens
go in the Vercel environment as `GOOGLE_SITE_VERIFICATION`,
`BING_SITE_VERIFICATION` and `YANDEX_VERIFICATION` (rendered as meta tags when set).

**Analytics** (all cookieless, so no consent banner):
- Vercel Web Analytics (`@vercel/analytics`), rendered only on Vercel.
- Vercel Speed Insights (`@vercel/speed-insights`), Core Web Vitals per route,
  rendered only on Vercel; reports to a same-origin endpoint (`connect-src 'self'`).
- PostHog (open source, EU cloud, project `jenspenneman.com`) via
  `instrumentation-client.ts`, loaded as its own chunk from an idle callback so
  the first paint never waits for it, reverse-proxied through `/pulse/*`
  rewrites so the CSP keeps `connect-src 'self'`; memory persistence,
  anonymous-only, pageviews only — no session recording, no exception
  autocapture — and Global Privacy Control is honoured.
  `NEXT_PUBLIC_POSTHOG_KEY` (the public project key) lives in the Vercel
  environment. Note: posthog-js drops events from automation (headless UA,
  `navigator.webdriver`, `userAgentData` brands), so headless probes never
  show captures.
Scripts are inserted by nonced Next chunks, which the CSP's `strict-dynamic`
permits.

## Performance

Pages render per request (the CSP nonce is unique per response) on Vercel's
Node runtime; static assets are content-hashed and immutable. The portrait is
AVIF/WebP/JPEG at 1x/2x with a type-gated preload; PNG icons are
palette-quantized. `npm run lighthouse` audits every locale (median of three
runs) and fails below 90 / 100 / 100 / 100 (production measures 100; shared CI
runners score 93-97 with the Next runtime).

**Smoothness** (`src/styles/platform.css` + `proxy.ts` + `layout.tsx`, all
standards, all progressive, all screen-only):
- `proxy.ts` sets `Cache-Control: private, max-age=0, must-revalidate` on the
  document instead of Next's default with `no-store`: shared caches still never
  store a nonced response and every navigation still re-renders, but Back/Forward
  can restore the page from the browser's back/forward cache in every engine
  (`no-store` blocks it in Firefox, and `no-cache` does too on HTTPS). This holds
  when the Next server serves the document itself (`next start`, the E2E suite).
  On Vercel the page function's own `Cache-Control` takes priority over headers
  from the proxy or `next.config.ts` (documented Vercel behaviour), so production
  still sends `no-store`; Chrome (since 2025) and Safari restore such pages from
  the back/forward cache anyway, Firefox re-renders them.
- A nonced `<script type="speculationrules">` prefetches the sibling locales on
  hover (`prefetch`, not `prerender`: the analytics scripts are not
  prerender-aware; a document rule, not a URL list, because WebKit ignores
  `eagerness` on lists). Prefetched documents pass through `proxy.ts`
  (`Sec-Purpose` header) so they carry the CSP they will be shown with.
- Cross-document view transitions for the language switch
  (`@view-transition { navigation: auto }`, the portrait morphs), smooth
  fragment scrolling, all inside `prefers-reduced-motion: no-preference`.
- `viewport-fit: cover` with safe-area padding,
  `touch-action: manipulation` on links, the portrait as high-priority LCP
  image decoded before first paint. Rejected after research (documented in
  the stylesheet): `content-visibility` (breaks sticky
  descendants, a11y exposure unspecified), `prerender`, `overscroll-behavior`,
  `hanging-punctuation`/`text-spacing-trim` (no-ops for this content).

## Security

`proxy.ts` runs on every document request — its matcher skips Next
internals, the `/pulse` analytics proxy, static files and the OG images, and
deliberately includes prefetches announced with `Sec-Purpose`, so a prefetched
document carries the policy it will be shown with. It negotiates
`Accept-Language` on `/` and redirects (307) to the best locale with
`Vary: Accept-Language`; rewrites an unknown first segment to a path no route
matches, so `global-not-found` renders it while the status stays 404; answers
anything but `GET`/`HEAD` with 405 and normalises the trailing slash; and sets
`Cache-Control: private, max-age=0, must-revalidate` in place of Next's
`no-store` (see Performance).

It sets a strict, **per-request nonce** Content-Security-Policy
(`default-src 'none'; script-src 'nonce-…' 'strict-dynamic'; style-src 'self'
'nonce-…'; …; frame-ancestors 'none'`) and Next applies the nonce to every
script and style it emits; `upgrade-insecure-requests` is added only over
HTTPS. The remaining headers (HSTS with preload, nosniff, X-Frame-Options,
Referrer-Policy, Permissions-Policy, COOP, CORP,
X-Permitted-Cross-Domain-Policies) come from `next.config.ts`.
`/.well-known/security.txt` (RFC 9116) is in public/; the GitHub repository
requires signed commits, CI and CodeQL on `main`. E2E asserts the policy and
that pages load without a single CSP violation. After the first deploy on a
new domain, submit it at hstspreload.org.

## Domain and DNS

Registrar: Hostinger. Authoritative DNS: Cloudflare (free plan, every record
DNS-only — Vercel serves the site directly, nothing is proxied, Universal SSL is
disabled so Cloudflare adds no CAA records of its own). DNSSEC is on (ECDSA
P-256, algorithm 13; the DS record lives at the registrar). The zone carries the
Vercel A/CNAME records, `CAA 0 issue "letsencrypt.org"`, a null SPF and a
`p=reject` DMARC (the domain sends no mail), and the search-engine verification
TXT records. Changing nameservers is scriptable through the Hostinger CLI; the
DS record is hPanel-only.

## Developing

```sh
npm install          # also installs the git hooks (lefthook)
npm run dev          # Next dev server
npm run check        # biome + tsc + knip + vitest  (CI's quality job; the
                     #   e2e, lighthouse and visual jobs all wait on it)
npm run test:e2e     # build, then Playwright against next start: Chromium,
                     #   WebKit and Pixel 7 run every spec; tablet (768) and
                     #   big (1920) run the two whose subject is geometry,
                     #   a11y and layout
npm run test:visual  # screenshot baselines at 1920/1280/768/390 and in print,
                     #   light and dark (macOS; `test:visual:update` re-records)
PW_PORT=4194 …       # both Playwright suites serve the build on 4173; set
                     #   PW_PORT to move the server (and the baseURL with it)
                     #   when a second checkout is already using that port
npm run lighthouse   # next start + audit every locale; fails below the score floors
npm run build        # next build (prebuild generates the portrait variants)
npm run start        # next start
```


- **Biome** formats and lints TS/TSX/JS/JSON/CSS (import sorting on save via
  the recommended VS Code extension).
- **lefthook** hooks: pre-commit = biome (staged) + typecheck, commit-msg =
  commitlint (Conventional Commits), pre-push = unit tests.
- **TypeScript 7** at maximum strictness, **knip** for dead code/deps,
  **Vitest** with coverage floors over `src/`, `app/` and `proxy.ts`.
- **Dependabot** weekly; families (React, Next, Vitest, Playwright, Biome,
  commitlint, Testing Library, ajv) are grouped, so even a major lands as one
  pull request.
- **CI** gates everything on `quality` and then runs, in parallel, E2E on
  Ubuntu, the Lighthouse score floors, and the visual baselines on macOS.
  The screenshot tolerance is 200 differing pixels (0.05%), not Playwright's
  default 1%, which a whole removed row would have slipped through.
