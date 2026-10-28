#!/usr/bin/env bash
# Copies only the files the site serves into a new folder, for the Cloudflare Worker (tools/deploy/stage.sh _site).
# The repo root also holds src/, tests/, tools/ and the Firebase files, which must not be published there.
# worker/ is not copied: wrangler bundles worker/index.js itself (tools/deploy/wrangler.json).
# Fails if a served file is missing, so a half-built site is never published.
# STAGE_ROOT=<dir> stages from another folder instead of this repo (used by tests/unit/route.test.mjs).
set -euo pipefail

FILES=(index.html welcome.html stats.html 404.html manifest.webmanifest sw.js move.json _headers)
DIRS=(icons landing)

if [ $# -ne 1 ] || [ -z "$1" ]; then
  echo "Usage: tools/deploy/stage.sh <new or empty folder>" >&2
  exit 2
fi
OUT=$1
ROOT=${STAGE_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}

if [ -e "$OUT" ] && [ -n "$(ls -A "$OUT" 2>/dev/null)" ]; then
  echo "stage.sh: $OUT is not empty. Give a new or empty folder." >&2
  exit 1
fi

missing=()
for f in "${FILES[@]}"; do
  [ -s "$ROOT/$f" ] || missing+=("$f")
done
for d in "${DIRS[@]}"; do
  [ -d "$ROOT/$d" ] || missing+=("$d/")
done
if [ -d "$ROOT/landing" ] && ! compgen -G "$ROOT/landing/*.jp*g" >/dev/null; then
  missing+=("landing/*.jpg (the landing page's pictures)")
fi
if [ -s "$ROOT/index.html" ] && ! grep -q "const BUILD = '" "$ROOT/index.html"; then
  missing+=("index.html is not a built game (no BUILD line; run python3 build.py)")
fi
if [ ${#missing[@]} -gt 0 ]; then
  echo "stage.sh: not staging, these are missing or empty in $ROOT:" >&2
  printf '  - %s\n' "${missing[@]}" >&2
  exit 1
fi

mkdir -p "$OUT"
for f in "${FILES[@]}"; do cp "$ROOT/$f" "$OUT/"; done
for d in "${DIRS[@]}"; do cp -R "$ROOT/$d" "$OUT/"; done
find "$OUT" -name .DS_Store -delete
echo "Staged $(find "$OUT" -type f | wc -l | tr -d ' ') files in $OUT"
