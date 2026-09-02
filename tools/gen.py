# -*- coding: utf-8 -*-
"""Generates app/cv-markup.ts — the inner markup of the CV sheet.

Coordinates are identical to the print master of "CV versie 3.pdf":
bottom-origin y0 values on an 841.92pt-high A4 canvas, converted to CSS top
via the Helvetica Neue ascender. Widths are measured from the macOS system
Helvetica Neue (no font files ship with the site; the page uses the system
font stack). Right-aligned values are emitted with CSS `right` so they stay
flush on systems that fall back to Arial.
"""
import os
from fontTools.ttLib import TTCollection

sc = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(sc, "..", "app", "cv-markup.ts")

H = 841.92; PAGE_W = 595.32
LEFT = 35.9; COL = 177.6; RIGHT = 559.32; W = RIGHT - COL

M = {
    ("hn", 400): dict(asc=0.952, lh=1.165, desc_pdf=0.22, ps="HelveticaNeue"),
    ("hn", 700): dict(asc=0.975, lh=1.192, desc_pdf=0.22, ps="HelveticaNeue-Bold"),
}

_w = {}
def _load():
    tc = TTCollection("/System/Library/Fonts/HelveticaNeue.ttc", lazy=True)
    by_ps = {}
    for f in tc.fonts:
        by_ps[f["name"].getDebugName(6)] = f
    for key, m in M.items():
        f = by_ps[m["ps"]]
        _w[key] = (f.getBestCmap(), f["hmtx"], f["head"].unitsPerEm)

def width(text, wt, size):
    if not _w:
        _load()
    cmap, hmtx, upm = _w[("hn", wt)]
    total = 0
    for ch in text:
        g = cmap.get(ord(ch))
        if g is None:
            raise ValueError(f"MISSING GLYPH {ch!r} wt={wt}")
        total += hmtx[g][0]
    return total / upm * size

GRAY = "#7F7F7F"; DGRAY = "#595959"; INTRO = "#3F3F3F"; BLACK = "#000000"

def span(x, y0, size, text, wt=400, color=GRAY, href=None, tag="div", plain=None, right_x=None):
    m = M[("hn", wt)]
    baseline = y0 + m["desc_pdf"] * size
    top = H - baseline - m["asc"] * size
    width((plain if plain is not None else text).replace("&amp;", "&"), wt, size)
    inner = f'<a href="{href}">{text}</a>' if href else text
    pos = f"right:{PAGE_W - right_x:.2f}pt" if right_x is not None else f"left:{x:.2f}pt"
    return (f'<{tag} class="t" style="{pos};top:{top:.2f}pt;'
            f'font-weight:{wt};font-size:{size}pt;line-height:{m["lh"]}em;color:{color}">{inner}</{tag}>')

def hline(x0, x1, y):
    return f'<div class="hl" style="left:{x0:.2f}pt;top:{H - y - 0.25:.2f}pt;width:{x1 - x0:.2f}pt"></div>'

def leader_row(y0, label, value, label_x=COL, right=RIGHT, size=9.0):
    lw = width(label, 400, size); vw = width(value, 700, size)
    vx = right - vw
    line_y = y0 + 0.22 * size + 0.35
    assert vx - 7 > label_x + lw + 7 + 15, f"row too tight: {label} / {value}"
    return [span(label_x, y0, size, label),
            span(0, y0, size, value, wt=700, color=BLACK, right_x=right),
            hline(label_x + lw + 7, vx - 7, line_y)]

parts = []
parts.append('<img class="bg" src="__BG__" alt="">')
parts.append('<img class="photo" src="__PHOTO__" alt="Portretfoto van Jens Penneman">')
# ---- header: contact line as natural flow with inline links
parts.append(
    f'<div class="t" style="left:{COL}pt;top:{H - 792.03 - 0.952 * 6.96:.2f}pt;font-weight:400;'
    f'font-size:6.96pt;line-height:1.165em;color:{DGRAY}">'
    'Teerlingstraat 69/2, 9190 Stekene, België&nbsp;&nbsp;-&nbsp;&nbsp;'
    '<a href="mailto:jenspenneman26@gmail.com">jenspenneman26@gmail.com</a>&nbsp;&nbsp;-&nbsp;&nbsp;'
    '<a href="tel:+32474180683">+32 474 18 06 83</a></div>')
parts.append(span(177.5, 751.6, 18.96, 'Jens Penneman, Software engineer', wt=700, color=BLACK, tag="h1"))
m = M[("hn", 400)]
baseline1 = 730.1 + 0.22 * 12; lh = 17.2 / 12
first_off = m["asc"] + (lh - m["lh"]) / 2
parts.append(f'<p class="t intro" style="left:{COL}pt;top:{H - baseline1 - first_off * 12:.2f}pt;width:{W:.1f}pt;'
             f'font-weight:400;font-size:12pt;line-height:{lh:.5f}em;color:{INTRO}">'
             'Full-stack software engineer met 4 jaar ervaring. Ik bouw dashboards, klantenportalen '
             'en koppelingen met externe diensten, van database tot pixel-perfecte interface.</p>')
# ---- personalia: two-column leader rows (dynamic widths)
R1 = 360.8
parts.append(span(LEFT, 633.0, 9.0, 'Personalia', tag="h2"))
parts += leader_row(632.9, 'Nationaliteit', 'Belg', label_x=COL, right=R1)
parts += leader_row(632.9, 'Rijbewijs', 'AM, B', label_x=369.6, right=RIGHT)
parts += leader_row(612.0, 'Geboorteplaats', 'Sint-Niklaas', label_x=COL, right=R1)
parts += leader_row(612.0, 'Geboortedatum', '23/11/2002', label_x=369.6, right=RIGHT)
# ---- werkervaring (uniform gap G=42 between sections)
parts.append(span(LEFT, 570.0, 9.0, 'Werkervaring', tag="h2"))
def entry(y_title, title, meta):
    return [span(COL, y_title, 12.0, title, wt=700, color=BLACK, tag="h3"),
            span(COL, y_title - 13.6, 9.0, meta)]
parts += entry(566.4, 'Full stack software engineer', 'bij Advantitge te Deinze, Juli 2025 - heden')
parts += entry(526.9, 'Full stack software engineer', 'bij Lemon Companies te Kontich, Juli 2024 - Mei 2025')
parts += entry(487.4, 'Student-zelfstandige', 'bij WEB4YOU te Stekene, Oktober 2021 - Juni 2024')
parts += entry(447.9, 'Stagiair front end engineer', 'bij BASF te Gent, Oktober 2023 - December 2023')
parts.append(span(COL, 412.3, 9.0, '+ 5 vakantiejobs', wt=700, color=BLACK))
vak = 'bij Bpost, Storaenso, Houtshop Van der Gucht, V3 Consulting… 2017 - 2022'
assert width(vak, 400, 9.0) <= W, "vak overflow"
parts.append(span(COL, 398.7, 9.0, vak))
# ---- vaardigheden
parts.append(span(LEFT, 356.7, 9.0, 'Vaardigheden', tag="h2"))
parts += leader_row(356.6, 'Frontend', 'React, NextJS, TypeScript, Tailwind, TanStack Query')
parts += leader_row(335.7, 'Backend', 'NodeJS, GraphQL, Hasura, REST, PostgreSQL, Strapi')
parts += leader_row(314.8, 'Cloud en tooling', 'AWS, Vercel, Supabase, Sentry, Git, pnpm, Turborepo')
# ---- opleidingen
parts.append(span(LEFT, 272.8, 9.0, 'Opleidingen', tag="h2"))
parts += entry(269.3, 'Toegepaste informatica', 'bij Hogeschool Gent, September 2020 - December 2023')
parts += entry(231.3, 'Industriële informatica &amp; communicatietechnieken', 'bij GTI Beveren, September 2018 - Juli 2020')
parts += entry(193.3, 'Elektromechanica', 'bij Broederschool Stekene, September 2016 - Juli 2018')
# ---- cursussen
parts.append(span(LEFT, 137.7, 9.0, 'Cursussen (geattesteerd)', tag="h2"))
x = COL
for text, wt in [('Instructeur', 700), ('(2024) en', 400), ('Hoofdanimator', 700), ('(2022) bij KLJ en de Vlaamse Overheid', 400)]:
    parts.append(span(x, 137.7, 9.0, text, wt=wt, color=BLACK if wt == 700 else GRAY))
    x += width(text, wt, 9.0) + 3.2
assert x - 3.2 <= RIGHT
# ---- talen
parts.append(span(LEFT, 95.7, 9.0, 'Talen', tag="h2"))
parts += leader_row(95.0, 'Moedertaal', 'Nederlands', label_x=COL, right=R1)
parts += leader_row(95.0, 'Zeer goed', 'Engels', label_x=369.6, right=RIGHT)
# ---- andere informatiekanalen
parts.append(span(LEFT, 53.7, 9.0, 'Andere informatiekanalen', tag="h2"))
parts.append(span(177.7, 55.0, 6.96, 'https://jenspenneman.com/', color=DGRAY, href='https://jenspenneman.com/'))
parts.append(span(177.7, 46.6, 6.96, 'https://linkedin.com/in/jenspenneman/', color=DGRAY, href='https://linkedin.com/in/jenspenneman/'))
parts.append(span(372.2, 55.0, 6.96, 'https://github.com/JensPenneman', color=DGRAY, href='https://github.com/JensPenneman'))

markup = "\n".join(parts)
escaped = markup.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
ts = ("// GENERATED by tools/gen.py — do not edit by hand. Run: pnpm gen\n"
      "export const cvHtml = `\n" + escaped + "\n`;\n")
with open(OUT, "w") as f:
    f.write(ts)
print("written", OUT, len(ts))
