#!/usr/bin/env bash
# Checks the live site after a deploy (.github/workflows/deploy.yml): play.pmlm.uk serves the game built from this
# checkout (same BUILD line as the local index.html), pmlm.uk serves the landing page, move.json can be read from
# any address, and pmlm.uk still serves sw.js (devices that installed the game there keep their service worker).
# Cloudflare can take a moment to switch every edge over, so it retries for up to 3 minutes (CHECK_LIVE_SECONDS).
set -euo pipefail
cd "$(dirname "$0")/../.."
PLAY=https://play.pmlm.uk
LANDING=https://pmlm.uk
MARKER='<meta[^>]*name="pmlm-page"[^>]*content="landing"'
LIMIT=${CHECK_LIVE_SECONDS:-180}

WANT=$(grep -o "const BUILD = '[^']*'" index.html | head -1 || true)
if [ -z "$WANT" ]; then
  echo "check-live.sh: index.html has no BUILD line. Run python3 build.py first." >&2
  exit 2
fi
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# get <url>: body in $TMP/body, headers in $TMP/head, status in $STATUS (000 when unreachable)
get() {
  : >"$TMP/body"; : >"$TMP/head"
  STATUS=$(curl -s --max-time 15 -H 'Cache-Control: no-cache' -o "$TMP/body" -D "$TMP/head" -w '%{http_code}' "$1" || true)
  [ -n "$STATUS" ] && [ "$STATUS" != 000 ] || STATUS='000 (not reachable)'
}
header() { tr -d '\r' <"$TMP/head" | grep -i "^$1:" | head -1 | cut -d: -f2- | sed 's/^ *//' || true; }

# Runs every check once; what is wrong goes in PROBLEMS
check() {
  PROBLEMS=()
  local t got
  t=$(date +%s)
  get "$PLAY/?check=$t"
  got=$(grep -o "const BUILD = '[^']*'" "$TMP/body" | head -1 || true)
  if [ "$STATUS" != 200 ] || [ "$got" != "$WANT" ]; then
    PROBLEMS+=("$PLAY/ should serve $WANT but gave status $STATUS with ${got:-no BUILD line}")
  fi
  get "$LANDING/?check=$t"
  if [ "$STATUS" != 200 ] || ! grep -Eq "$MARKER" "$TMP/body"; then
    PROBLEMS+=("$LANDING/ should be the landing page (pmlm-page meta) but gave status $STATUS without it")
  fi
  get "$PLAY/move.json"
  if [ "$STATUS" != 200 ] || [ "$(header access-control-allow-origin)" != '*' ] || ! header cache-control | grep -q no-store; then
    PROBLEMS+=("$PLAY/move.json should be 200 with Access-Control-Allow-Origin: * and no-store, but gave status $STATUS, ACAO '$(header access-control-allow-origin)', Cache-Control '$(header cache-control)'")
  fi
  get "$LANDING/sw.js"
  if [ "$STATUS" != 200 ]; then
    PROBLEMS+=("$LANDING/sw.js should be 200 but gave status $STATUS")
  fi
  [ ${#PROBLEMS[@]} -eq 0 ]
}

START=$(date +%s)
while ! check; do
  if [ $(( $(date +%s) - START )) -ge "$LIMIT" ]; then
    echo "check-live.sh: the live site is still not right after ${LIMIT} seconds:" >&2
    printf '  - %s\n' "${PROBLEMS[@]}" >&2
    exit 1
  fi
  echo "Waiting for the live site (${#PROBLEMS[@]} check(s) not passing yet: ${PROBLEMS[0]})"
  sleep 10
done
echo "Live: $PLAY/ serves $WANT, $LANDING/ is the landing page, move.json and sw.js are served."
