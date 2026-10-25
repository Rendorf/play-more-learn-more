#!/usr/bin/env bash
# Everything that must pass before a change goes to main. GitHub runs it on every pull request and on main
# (.github/workflows/test.yml). Run it yourself from anywhere:  tests/run-all.sh
# Needs Node 22, Python 3 and Java 21 (Homebrew: brew install openjdk).
set -euo pipefail
cd "$(dirname "$0")/.."
step() { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }
[ -d /opt/homebrew/opt/openjdk/bin ] && export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"

step "Installing the test tools"
(cd tests && npm ci --no-audit --no-fund --loglevel=error)
(cd tools/rules-test && npm ci --no-audit --no-fund --loglevel=error)
(cd tools/admin && npm ci --no-audit --no-fund --loglevel=error)
if [ -n "${CI:-}" ]; then (cd tests && npx playwright install --with-deps chromium webkit); else (cd tests && npx playwright install chromium webkit); fi

step "1/5 Question content, all grades"
node tools/check-content.mjs src/grade*.js

step "2/5 index.html, stats.html and the manifest are built from src/"
python3 build.py --check

step "3/5 Unit tests: leaderboard, reminders, online module"
(cd tests && npm run -s unit)

step "4/5 Database rules, in the Firestore emulator"
(cd tests && npx firebase emulators:exec --project demo-pmlm --config ../firebase.json --only firestore "cd ../tools/rules-test && npm test")

step "5/5 Browser tests: the game, progress safety, family sync across versions, new features, phones and tablets"
(cd tests && npm run -s e2e)

printf '\n\033[1;32m✓ All checks passed.\033[0m\n'
