# cv-site

Jens's CV as a data-driven Next.js app on Vercel (npm, Node LTS via `.nvmrc`).

## Layout

```
app/            Next App Router: routes + metadata file conventions only
  [locale]/     root layout (html lang, JSON-LD, metadata), page, build-time OG card
  global-not-found.tsx  404 in the CV design with a link per language
  sitemap.ts robots.ts manifest.ts icon0.png icon1.svg apple-icon.png
src/
  assets/       photo.jpg + the build-time OG card fonts
  components/   one component per file (Header, Section, Pairs, Entry, ...)
  content/      cv.json (the data model) + cv.schema.json
  lib/cv/       typed data access + view-model derivations (one function per file)
  lib/format/   Intl-based, locale-aware formatters (one per file)
  lib/i18n/     locales, localized-string helper, labels + templates per locale
  lib/seo/      metadata, viewport, JSON-LD builder, site URL, page title
  styles/       globals.css (the whole design)
scripts/        images (prebuild), icons (manual), hooks (local git hooks), lighthouse (score gate)
proxy.ts        per-request nonce CSP + Accept-Language negotiation for /
tests/unit/     Vitest: formatters, i18n, data-model rules, SEO, components
tests/e2e/      Playwright: content per locale, negotiation, axe WCAG AAA, security, print
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
- Print (`--pt: 1pt`) reproduces the exact CV on A4 via the native browser
  print action, gradient wash included — verified against the PDF master.
- Colors authored in HCL (CSS `lch()`, gradients `in lch`), sRGB fallbacks.
- WCAG 2.2 AAA on screen (axe-audited in E2E): >= 7:1 contrast, 1.5 line
  spacing + no justification for paragraphs, >= 44px link targets, focus
  outlines, landmarks (`section[aria-labelledby]`), `dl` semantics, h1-h3.
- Follows the system on screen only (print is always the light master):
  dark mode (`prefers-color-scheme`), increased contrast (`prefers-contrast:
  more` — >= 15:1 inks, heavier leader lines, underlined links, thicker focus
  ring, light and dark variants) and Windows Contrast Themes
  (`forced-colors: active` — system-color roles, structure carried by borders
  and underlines). All four combinations are axe-audited in E2E.

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

**Analytics** (both cookieless, so no consent banner):
- Vercel Web Analytics (`@vercel/analytics`), rendered only on Vercel.
- PostHog (open source, EU cloud, project `jenspenneman.com`) via
  `instrumentation-client.ts`, reverse-proxied through `/pulse/*` rewrites so the
  CSP keeps `connect-src 'self'`; memory persistence, anonymous-only, no
  session recording, exception autocapture on. `NEXT_PUBLIC_POSTHOG_KEY` (the
  public project key) lives in the Vercel environment. Note: posthog-js drops
  events from automation (headless UA, `navigator.webdriver`,
  `userAgentData` brands), so headless probes never show captures.
Scripts are inserted by nonced Next chunks, which the CSP's `strict-dynamic`
permits.

## Performance

Pages render per request (the CSP nonce is unique per response) on Vercel's
Node runtime; static assets are content-hashed and immutable. The portrait is
AVIF/WebP/JPEG at 1x/2x with a type-gated preload; PNG icons are
palette-quantized. `npm run lighthouse` audits every locale (median of three
runs) and fails below 90 / 100 / 100 / 100 (production measures 100; shared CI
runners score 93-97 with the Next runtime).

## Security

`proxy.ts` sets a strict, **per-request nonce** Content-Security-Policy
(`default-src 'none'; script-src 'nonce-…' 'strict-dynamic'; style-src 'self'
'nonce-…'; …; frame-ancestors 'none'`) and Next applies the nonce to every
script and style it emits; `upgrade-insecure-requests` is added only over
HTTPS. The remaining headers (HSTS with preload, nosniff, X-Frame-Options,
Referrer-Policy, Permissions-Policy, COOP, CORP) come from `next.config.ts`.
`/.well-known/security.txt` (RFC 9116) is in public/; the GitHub repository
requires signed commits, CI and CodeQL on `main`. E2E asserts the policy and
that pages load without a single CSP violation. After the first deploy on a
new domain, submit it at hstspreload.org.

## Developing

```sh
npm install          # also installs the git hooks (lefthook)
npm run dev          # Next dev server
npm run check        # biome + tsc + knip + vitest  (what CI runs first)
npm run test:e2e     # build, then Playwright against next start (Chromium, WebKit, mobile)
npm run test:visual  # screenshot baselines (macOS; `test:visual:update` to re-record)
npm run lighthouse   # next start + audit every locale; fails below the score floors
npm run build        # next build (prebuild generates the portrait variants)
npm run start        # next start
```


- **Biome** formats and lints TS/TSX/JS/JSON/CSS (import sorting on save via
  the recommended VS Code extension).
- **lefthook** hooks: pre-commit = biome (staged) + typecheck, commit-msg =
  commitlint (Conventional Commits), pre-push = unit tests.
- **TypeScript 7** at maximum strictness, **knip** for dead code/deps,
  **Dependabot** weekly, **CI** runs the full pipeline incl. E2E and the
  Lighthouse gate on Ubuntu, plus the visual baselines on macOS.
