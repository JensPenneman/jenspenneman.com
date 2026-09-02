# cv-site

Jens's CV reconstructed fully in HTML/CSS as a static Next.js app (`output: "export"`).

- Semantic markup in [app/page.tsx](app/page.tsx); the whole design lives in
  [app/globals.css](app/globals.css).
- One design unit `--pt` drives every dimension; the numbers in
  `calc(var(--pt) * N)` are the print master's point values verbatim.
- Layouts: mobile (stacked), tablet (narrow label gutter), desktop (A4 canvas),
  big screen (grown sheet), print (`--pt: 1pt` -> exact CV on A4 via the native
  browser print action, `@page` A4 margin 0).
- Colors and gradients are authored in HCL (CSS `lch()`, gradients `in lch`)
  with sRGB fallbacks.
- Fonts: system stack ("Helvetica Neue", Helvetica, Arial) — nothing served.

```sh
npm run build      # static export to out/
npm run preview    # serve out/ (pass a port: npm run preview -- 8123)
```
