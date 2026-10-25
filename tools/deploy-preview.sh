#!/usr/bin/env bash
# Publishes the preview copy (python3 build.py --preview) to https://rendorf.github.io/pmlm-preview/ so a new
# version can be tried on real phones before it is merged. The preview uses the staging Firebase project and its
# own storage keys, so it never touches the real game, real progress or live data.
# The first run creates the Rendorf/pmlm-preview repository and turns on GitHub Pages for it.
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=Rendorf/pmlm-preview
python3 build.py --preview

NEW=0
if ! gh repo view "$REPO" >/dev/null 2>&1; then
  gh repo create "$REPO" --public --description "Preview copy of Play More Learn More for testing on real phones (staging data only)"
  NEW=1
fi
WORK=build/preview-repo
rm -rf "$WORK"
git clone -q "https://github.com/$REPO.git" "$WORK" 2>/dev/null
git -C "$WORK" checkout -q -B main
rsync -a --delete --exclude .git build/preview/ "$WORK/"
git -C "$WORK" add -A
git -C "$WORK" commit -q -m "Preview of $(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD)" || echo "No changes since the last preview."
git -C "$WORK" push -q -u origin main
if [ "$NEW" = 1 ]; then
  gh api -X POST "repos/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null
fi
echo "Preview: https://rendorf.github.io/pmlm-preview/ (live in 1–2 minutes)"
