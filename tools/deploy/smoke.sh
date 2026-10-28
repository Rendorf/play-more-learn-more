#!/usr/bin/env bash
# Tries the site in Cloudflare's own local server (wrangler dev) before it is published: stages the served files
# (stage.sh) into a temporary folder, serves them with the Worker (worker/index.js) and the settings in
# tools/deploy/wrangler.json, and checks that the game, the landing page, move.json's headers and the not-found page
# come back as they will on pmlm.uk.
# Run from anywhere: bash tools/deploy/smoke.sh (installs the pinned wrangler on first use). SMOKE_PORT changes the port.
set -euo pipefail
cd "$(dirname "$0")/../.."
PORT=${SMOKE_PORT:-8788}
BASE="http://127.0.0.1:$PORT"
WRANGLER=tools/deploy/node_modules/.bin/wrangler
MARKER='<meta[^>]*name="pmlm-page"[^>]*content="landing"'
export WRANGLER_SEND_METRICS=false

[ -x "$WRANGLER" ] || (cd tools/deploy && npm ci --no-audit --no-fund)
if curl -s -o /dev/null --max-time 2 "$BASE/"; then
  echo "smoke.sh: something is already listening on port $PORT. Stop it or set SMOKE_PORT." >&2
  exit 1
fi

TMP=$(mktemp -d)
SERVER_PID=''
cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    for _ in 1 2 3 4 5 6 7 8 9 10; do kill -0 "$SERVER_PID" 2>/dev/null || break; sleep 0.5; done
    kill -9 "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

tools/deploy/stage.sh "$TMP/site"
# The real settings, pointed at the staged copy
node -e 'const fs = require("fs"), path = require("path"), c = JSON.parse(fs.readFileSync("tools/deploy/wrangler.json", "utf8"));
  delete c.$schema; c.main = path.resolve("worker/index.js"); c.assets.directory = process.argv[1];
  fs.writeFileSync(process.argv[2], JSON.stringify(c, null, 2));' "$TMP/site" "$TMP/wrangler.json"
"$WRANGLER" dev -c "$TMP/wrangler.json" --ip 127.0.0.1 --port "$PORT" --persist-to "$TMP/state" \
  --show-interactive-dev-session=false >"$TMP/server.log" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 120); do
  curl -s -o /dev/null --max-time 2 "$BASE/sw.js" && break
  kill -0 "$SERVER_PID" 2>/dev/null || { echo "smoke.sh: wrangler stopped:" >&2; cat "$TMP/server.log" >&2; exit 1; }
  sleep 0.5
done
curl -s -o /dev/null --max-time 2 "$BASE/sw.js" || { echo "smoke.sh: wrangler didn't start in 60 seconds:" >&2; cat "$TMP/server.log" >&2; exit 1; }

FAILS=0
ok() { echo "ok   - $1"; }
bad() { echo "FAIL - $1"; FAILS=$((FAILS + 1)); }
# get <url> [curl args…]: body in $TMP/body, headers in $TMP/head, status in $STATUS
get() {
  local url=$1; shift
  : >"$TMP/body"; : >"$TMP/head"
  STATUS=$(curl -s --max-time 10 -o "$TMP/body" -D "$TMP/head" -w '%{http_code}' "$@" "$url" || echo 000)
}
has() { grep -Eq "$1" "$TMP/body"; }
header() { tr -d '\r' <"$TMP/head" | grep -i "^$1:" | head -1 | cut -d: -f2- | sed 's/^ *//'; }

get "$BASE/"
if [ "$STATUS" = 200 ] && has "const BUILD = '" && ! has "$MARKER"; then ok "/ is the game ($(grep -o "const BUILD = '[^']*'" "$TMP/body"))"
else bad "/ should be the game (status $STATUS)"; fi

get "$BASE/move.json"
if [ "$STATUS" = 200 ] && has '"play-more-learn-more"'; then ok "/move.json is served"; else bad "/move.json (status $STATUS)"; fi
[ "$(header access-control-allow-origin)" = '*' ] && ok "/move.json: Access-Control-Allow-Origin: *" \
  || bad "/move.json Access-Control-Allow-Origin is '$(header access-control-allow-origin)', not *"
header cache-control | grep -q 'no-store' && ok "/move.json: Cache-Control no-store" \
  || bad "/move.json Cache-Control is '$(header cache-control)', not no-store"

get "$BASE/sw.js"
[ "$STATUS" = 200 ] && ok "/sw.js is served" || bad "/sw.js (status $STATUS)"

get "$BASE/manifest.webmanifest"
[ "$STATUS" = 200 ] && ok "/manifest.webmanifest is served" || bad "/manifest.webmanifest (status $STATUS)"

get "$BASE/welcome"
if [ "$STATUS" = 200 ] && has "$MARKER"; then ok "/welcome is the landing page"; else bad "/welcome should be the landing page (status $STATUS)"; fi

pics=0; lost=0
for p in $(grep -oE '(src|href)="(icons|landing)/[^"]+"' "$TMP/site/welcome.html" | sed -E 's/^(src|href)="//; s/"$//' | sort -u); do
  get "$BASE/$p"
  if [ "$STATUS" = 200 ]; then pics=$((pics + 1)); else bad "/$p, used by welcome.html, is missing (status $STATUS)"; lost=1; fi
done
[ "$lost" = 0 ] && ok "the $pics pictures and icons welcome.html uses are all served"

get "$BASE/welcome.html"
case "$STATUS:$(header location)" in
  30[178]:/welcome) ok "/welcome.html redirects to /welcome" ;;
  *) bad "/welcome.html should redirect to /welcome (status $STATUS, location '$(header location)')" ;;
esac

get "$BASE/index.html"
case "$STATUS:$(header location)" in
  30[178]:/) ok "/index.html redirects to /" ;;
  *) bad "/index.html should redirect to / (status $STATUS, location '$(header location)')" ;;
esac

get "$BASE/no-such-page"
if [ "$STATUS" = 404 ] && has 'Page not found'; then ok "a mistyped address gets 404.html, not the game"
else bad "/no-such-page should be 404 with 404.html (status $STATUS)"; fi

get "$BASE/worker/index.js"
[ "$STATUS" = 404 ] && ok "the Worker's source is not served as a file" || bad "/worker/index.js is served (status $STATUS)"

# The host checks need wrangler to pass the Host header through to the Worker
on() { get "http://$1:$PORT$2" --resolve "$1:$PORT:127.0.0.1"; }
on pmlm.uk /
if [ "$STATUS" = 200 ] && has "$MARKER"; then
  ok "pmlm.uk/ is the landing page"
  on www.pmlm.uk /
  [ "$STATUS" = 200 ] && has "$MARKER" && ok "www.pmlm.uk/ is the landing page" || bad "www.pmlm.uk/ should be the landing page (status $STATUS)"
  on pmlm.uk '/?stay=1'
  [ "$STATUS" = 200 ] && has "const BUILD = '" && ! has "$MARKER" && ok "pmlm.uk/?stay=1 is the game" || bad "pmlm.uk/?stay=1 should be the game (status $STATUS)"
  on play.pmlm.uk /
  [ "$STATUS" = 200 ] && has "const BUILD = '" && ! has "$MARKER" && ok "play.pmlm.uk/ is the game" || bad "play.pmlm.uk/ should be the game (status $STATUS)"
  on pmlm.uk /move.json
  [ "$STATUS" = 200 ] && has '"play-more-learn-more"' && ok "pmlm.uk/move.json is served" || bad "pmlm.uk/move.json (status $STATUS)"
elif [ "$STATUS" = 200 ] && has "const BUILD = '"; then
  echo "note - wrangler dev did not pass the pmlm.uk host to the Worker; host checks skipped (tests/unit/route.test.mjs covers them)"
else
  bad "pmlm.uk/ should be the landing page (status $STATUS)"
fi

if [ "$FAILS" -gt 0 ]; then
  echo "$FAILS check(s) failed. wrangler's log:"
  cat "$TMP/server.log"
  exit 1
fi
echo "All smoke checks passed."
