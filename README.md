# cv-site

Web copy of `CV versie 3.pdf` as a fully static Next.js app (`output: "export"`).

- `app/cv-markup.ts` is **generated** — edit `tools/gen.py`, then run `pnpm gen`.
- Layout metrics come from Helvetica Neue on macOS (`/System/Library/Fonts/HelveticaNeue.ttc`);
  the site itself uses the system font stack (no font files are served).
- Printing happens via the native browser print action only (`@page` A4, margin 0).

```sh
pnpm gen        # regenerate app/cv-markup.ts
pnpm build      # static export to out/
pnpm preview    # serve out/ (pass a port: pnpm preview 8123)
```
