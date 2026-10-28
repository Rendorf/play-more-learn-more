# Testing

**Who this is for:** engineers making any change, and the owner reviewing a pull request.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

Everything that must pass before a change reaches `main` is in `tests/run-all.sh`. GitHub runs it on every pull request and on `main` (`.github/workflows/test.yml`, check name **test**). Nothing here ever uses the real Firebase project.

## Run everything

Needs Node 22, Python 3 and Java 21 (Homebrew `openjdk`; the script adds it to `PATH` when it is there).

```bash
tests/run-all.sh
```

## The layers

| Step | What it checks | Command inside the script |
|---|---|---|
| 0 | Installs test tools and Playwright browsers (Chromium, WebKit) | `npm ci` in `tests/`, `tools/rules-test/`, `tools/admin/` |
| 1 | Question content for all grades | `node tools/check-content.mjs src/grade*.js` |
| 2 | `index.html`, `stats.html`, `welcome.html` and the manifest are built from `src/`; every landing picture exists and is under 200 KB | `python3 build.py --check` |
| 3 | Unit tests | `cd tests && npm run unit` |
| 4 | Database rules in the Firestore emulator | `firebase emulators:exec … "cd ../tools/rules-test && npm test"` |
| 5 | Browser tests against the Auth and Firestore emulators | `cd tests && npm run e2e` |

### Unit tests (`tests/unit/`)

Node's built-in test runner. `load.mjs` loads browser source files into a sandbox.

- `board.test.mjs`: nicknames, ISO weeks, active minutes, ranking.
- `reminders.test.mjs`: reminder timing in time zones, back-off and stopping.
- `online.test.mjs`: where `Online` is on or off, feature switches, preview storage keys, the REST value format, reminders needing the Home Screen on iPhone, and the invite flow.
- `move.test.mjs`: which addresses send devices on (never the new one), what a device takes along (`Move.payload()`), and packing it into the link.
- `landing.test.mjs`: every decision the landing page makes before drawing (show, forward, move, iPhone code).
- `route.test.mjs`: the Worker's host routing (`worker/index.js`) and its settings (`tools/deploy/wrangler.json`), `_headers` for `move.json`, and that `tools/deploy/stage.sh` uploads only the served files.

### Rules tests (`tools/rules-test/rules.test.mjs`)

17 tests. Families can't see each other; codes work once, expire and can't be listed; unlinked devices lose access; each extras collection allows only what it should; extras can't reach family data; invites pay once.

### Browser tests (`tests/e2e/`)

Playwright, one worker (the tests share the emulators). `setup.mjs` first builds the preview copy and the mock-Firebase page, and fetches the version that is live on `main` to compare with.

| Spec | Covers |
|---|---|
| `existing.spec.mjs` | every main flow: placement, lessons, practice, PIN, wishes, boss, Fix-it, shop, themes, backup codes |
| `progress.spec.mjs` | progress safety (below) |
| `sync.spec.mjs` | family accounts across versions, with the mock backend |
| `features.spec.mjs` | the family-test extras against the emulators with the real rules |
| `invites.spec.mjs` | invite a friend end to end, each device its own browser context |
| `admin.spec.mjs` | the reminder sender and backup/restore against the emulator |
| `layout.spec.mjs` | phones and tablets: no sideways scrolling, no cut-off tabs |
| `move.spec.mjs` | moving from the old GitHub address to play.pmlm.uk: all progress arrives, removed players stay removed, a family device is told to link again, the iPhone code route |
| `landing.spec.mjs` | the landing page: both halves, every picture loads, a device that played on pmlm.uk moves once, invites and `#move=` pass through, an unreachable game leaves everything in place, the iPhone code screen |
| `landing-layout.spec.mjs` | the landing page fits phones and tablets (runs on every device project) |
| `selftest.spec.mjs` | every generator and picture inside Chromium and WebKit |

Projects in `tests/playwright.config.mjs`: desktop Chrome for everything; iPhone 13 (WebKit) for self-test, layout and existing flows; Pixel 7 for layout; iPad for self-test and layout.

## Progress safety

`tests/e2e/progress.spec.mjs` proves children's progress is never lost:

1. Progress saved by the live version (`tests/fixtures/live-*.json`) opens in the new version with every value as before.
2. Playing on the new version only adds: counters go up; mastery, wishes, coins and purchases stay.
3. Rolling back is safe: the live version opens the new version's saves and keeps the new fields.
4. Backup codes from the live version work in the new version.
5. The preview copy never touches the real saved progress on the same phone.

The fixtures are made by playing the live version like a family would (`tests/make-fixtures.mjs`, test player names only). Refresh them only when you want fixtures from a newer live version. It needs a local server on port 8766 from the repository root.

```bash
python3 -m http.server 8766 --bind 127.0.0.1
```

```bash
cd tests && npm run fixtures
```

## Run one area

Unit tests only:

```bash
cd tests && npm run unit
```

Browser tests matching a name (the emulators start and stop by themselves):

```bash
cd tests && npm run e2e -- -g leaderboard
```

Rules tests, with the emulator in a second terminal:

```bash
cd tools/rules-test && npm install && npm run emulator
```

```bash
cd tools/rules-test && FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm test
```

Content for one grade:

```bash
node tools/check-content.mjs src/grade6.js
```

## Trying the game by hand

Local preview (online extras are off on localhost):

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open `http://localhost:8765/index.html`. Useful hashes:

- `#selftest`: runs every generator and picture, then sets `window.__selftest` (201 skills, 0 errors).
- `#debug`: Parents → Debug has "Next day ⏭" (a day shift kept in sessionStorage) and "Play a perfect round". `window.__pmlm` exposes the state.

### With the emulators (`?emu=1`)

Start the Auth and Firestore emulators (project `demo-pmlm`, ports 9099 and 8080 from `firebase.json`):

```bash
cd tests && npx firebase emulators:start --project demo-pmlm --config ../firebase.json --only auth,firestore
```

Then open `http://localhost:8765/index.html?emu=1`. `Online` then talks to the local emulators with the real rules.

### Family accounts with the mock backend

`tools/mock-firebase.js` is an in-memory stand-in for the Firebase compat SDK, with a small copy of the rules. `make-synctest.py` writes the built game wired to it:

```bash
python3 build.py
```

```bash
python3 tools/make-synctest.py
```

Open `build/synctest.html` through the local server. Each "device" is a localStorage snapshot, and the mock "server" lives in sessionStorage, so one tab can play several devices by swapping localStorage and reloading. `window.__mock` shows the server documents.

## Rules for tests

- Never test against the live family data, and don't create accounts in the owner's Firebase project.
- Run `tests/run-all.sh` before every merge.
- When a test fails in CI, the Playwright report is uploaded as the `test-report` artifact for 7 days.
