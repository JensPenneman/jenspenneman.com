#!/usr/bin/env bash
# Bootstraps a local venv with fontTools and regenerates app/cv-markup.ts
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d .venv ] || python3 -m venv .venv
.venv/bin/python -c "import fontTools" 2>/dev/null || .venv/bin/pip install -q fonttools
.venv/bin/python tools/gen.py
