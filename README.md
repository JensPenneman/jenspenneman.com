# cv-site

Jens's CV as a fully static, data-driven Next.js app (`output: "export"`, npm).

## Editing the CV

All content lives in [app/cv.json](app/cv.json) — a pure data model
(ISO dates, E.164 phone, arrays), validated by
[app/cv.schema.json](app/cv.schema.json) (`$schema` gives autocomplete in the
editor). The UI derives every display string in
[app/format.ts](app/format.ts) / [app/page.tsx](app/page.tsx):
Dutch month names via `Intl`, "bij X te Y" composition, list joining, phone
grouping. Labels/headings are presentation and live in `page.tsx`, not in the
data.

## Design

- One design unit `--pt` in [app/globals.css](app/globals.css); the numbers in
  `calc(var(--pt) * N)` are the print master's point values verbatim.
- Screen is a fluid webpage (rem-based unit, em media queries — browser zoom
  and user font-size settings scale everything coherently): mobile < 40em
  stacked, tablet 40-64em narrow gutter, desktop, big >= 100em.
- Print (`--pt: 1pt`) reproduces the exact CV on A4 via the native browser
  print action, gradient wash included — verified against the PDF master.
- Colors authored in HCL (CSS `lch()`, gradients `in lch`), sRGB fallbacks.
- WCAG 2.2 AAA on screen: >= 7:1 contrast tokens, 1.5 line spacing and no
  justification for paragraph text, >= 44px link targets, focus outlines,
  full semantic/landmark structure (`dl`, `section[aria-labelledby]`,
  h1-h3), JSON-LD Person/ProfilePage for reader modes and crawlers.

```sh
npm run build      # static export to out/
npm run preview    # serve out/ (pass a port: npm run preview -- 8123)
```
