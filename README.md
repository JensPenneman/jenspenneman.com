# cv-site

Jens's CV as a fully static, data-driven Next.js app (`output: "export"`, npm, Node LTS).

## Layout

```
app/            Next App Router: routes + metadata file conventions only
  [locale]/     root layout (html lang, JSON-LD, metadata), page, build-time OG card
  global-not-found.tsx  404 in the CV design with a link per language
  sitemap.ts robots.ts manifest.ts icon0.png icon1.svg apple-icon.png
src/
  assets/       photo.jpg
  components/   one component per file (Header, Section, Pairs, Entry, ...)
  content/      cv.json (the data model) + cv.schema.json
  lib/cv/       typed data access + view-model derivations (one function per file)
  lib/format/   Intl-based, locale-aware formatters (one per file)
  lib/i18n/     locales, localized-string helper, labels + templates per locale
  lib/seo/      metadata, viewport, JSON-LD builder, site URL, page title
  styles/       globals.css (the whole design)
scripts/        clean/images (prebuild), postbuild (hardening), serve (Vercel-like server),
                localCert (HTTPS), lighthouse (score gate)
tests/unit/     Vitest: formatters, i18n, data-model rules, SEO, components
tests/e2e/      Playwright: content per locale, negotiation, axe WCAG AAA, security, print
tests/visual/   Playwright screenshot baselines (macOS)
```

House rule: **one file = one purpose.** No multi-component files, no barrels.

## Languages

Four locales at BCP 47 paths: `/nl-BE` (default), `/en-GB`, `/fr-BE`, `/de-BE`.
Each page carries its own `lang`, title/description, canonical, `hreflang`
alternates (+ `x-default`), `og:locale`, JSON-LD `inLanguage` and sitemap
alternates. The root `/` is negotiated from `Accept-Language` by the redirects
in `vercel.json` (mirrored locally by `scripts/serve.mjs`); `scripts/postbuild.mjs`
writes a script-free meta-refresh fallback for hosts without edge redirects.
UI strings and composition templates live in `src/lib/i18n/labels/<locale>.ts`.

## Editing the CV

All content lives in [src/content/cv.json](src/content/cv.json) — a pure data
model (ISO dates, E.164 phone, arrays; human-language fields are objects with
all four locales) validated by
[src/content/cv.schema.json](src/content/cv.schema.json) (`$schema` gives editor
autocomplete + validation; the unit tests validate it too). The UI derives every
display string (`src/lib/format`, `src/lib/cv`): Dutch month names via `Intl`,
"bij X te Y" composition, list joining, phone grouping. Labels/headings are
presentation and live in `src/lib/labels.ts`.

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
JSON-LD `ProfilePage`/`Person`. After deploying: verify the domain in Google Search
Console and submit `/sitemap.xml`.

**Analytics**: deliberately none — the CSP ships script-free and GA4 would
require a GDPR consent banner. Options when wanted: Vercel Web Analytics
(cookieless) or self-hosted Plausible/Umami; each needs `script-src` opened in
`vercel.json` and `scripts/postbuild.mjs`.

## Performance

First load of a locale page is **two requests, ~7 KB brotli**: the HTML (with
the stylesheet inlined by `scripts/postbuild.mjs` and allowed through a CSP
`sha256` hash — never `unsafe-inline`) plus a 2 KB AVIF portrait; no
JavaScript, no web fonts. `npm run sizes` prints the per-asset report and fails
above a 12 KB critical-path budget (CI runs it). PNG icons are palette-quantized
by the image pipeline; the AVIF portrait is preloaded (type-gated) as the LCP
candidate; the OG cards are re-encoded losslessly (175 -> 58 KB). Lighthouse:
100 / 100 / 100 / 100 on every locale.

## Security

The export ships **zero executable JavaScript**: `scripts/postbuild.mjs` strips
the Next runtime (JSON-LD is data, never executed), injects a strict CSP
`<meta>` (`default-src 'none'`, the inlined stylesheet by hash, `connect-src
'self'` only so audit tools can probe robots.txt/llms.txt from the page) and
fails the build if a script survives. A
nonce is impossible on a static site (per-response uniqueness); no scripts at
all is strictly stronger. Header-only directives (`frame-ancestors`, HSTS,
COOP/COEP/CORP, Permissions-Policy, nosniff) live in [vercel.json](vercel.json);
`/.well-known/security.txt` (RFC 9116) is in public/. E2E asserts all of it.
After the first deploy, submit the domain at hstspreload.org (the header
already carries `preload`).

## Developing

```sh
npm install          # also installs the git hooks (lefthook)
npm run dev          # Next dev server
npm run check        # biome + tsc + knip + vitest  (what CI runs first)
npm run test:e2e     # build, then Playwright (Chromium, WebKit, mobile)
npm run test:visual  # screenshot baselines (macOS; `test:visual:update` to re-record)
npm run lighthouse   # serve + audit every locale; fails below the score floors
npm run sizes        # first-load size report + brotli budget
npm run build        # static export to out/ + postbuild hardening
npm run preview      # serve out/ over HTTPS (node scripts/serve.mjs [port] [--http])
```

The preview is **HTTPS** with a self-signed certificate (`.certs/`, generated
on first run; install [mkcert](https://github.com/FiloSottile/mkcert) to get one
your OS trusts). Reason: the production CSP carries `upgrade-insecure-requests`
and WebKit applies it to loopback too ([bug 250776](https://bugs.webkit.org/show_bug.cgi?id=250776)),
so over plain http Safari upgrades every asset to https and the page loses its
CSS. Serving https locally keeps the policy identical to production. E2E runs
against the same server in Chromium, WebKit and mobile Chrome.

- **Biome** formats and lints TS/TSX/JS/JSON/CSS (import sorting on save via
  the recommended VS Code extension).
- **lefthook** hooks: pre-commit = biome (staged) + typecheck, commit-msg =
  commitlint (Conventional Commits), pre-push = unit tests.
- **TypeScript 7** at maximum strictness, **knip** for dead code/deps,
  **Dependabot** weekly, **CI** runs the full pipeline incl. E2E and the
  Lighthouse gate on Ubuntu, plus the visual baselines on macOS.
