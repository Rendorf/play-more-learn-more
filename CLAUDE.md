# Play More Learn More

A DopaDrill-style maths practice game for the Cambridge curriculum, Grades 1–9 (Primary Stages 1–6, Lower Secondary 7–9). Single-page, no framework, no server of its own.

- **Live:** https://rendorf.github.io/play-more-learn-more/ (GitHub Pages, deploys from `main`)
- **Repo:** https://github.com/Rendorf/play-more-learn-more (public: never commit personal or family details here; use `CLAUDE.local.md`, which is gitignored)
- **claude.ai copy:** https://claude.ai/artifact/UyznLuwo4usV7cnubQ75Tt. Publish `build/artifact.html` with the Artifact tool and pass this URL as `url`. That copy has no Firebase, because the artifact CSP blocks gstatic, so it uses the artifact `db` capability instead.

## Layout
- `src/` is the source; `index.html` is **generated**. Never edit `index.html` by hand.
  - `config.js`: Firebase web config (`PMLM_FIREBASE`; public by design).
  - `util.js`: `U` helpers for question generators.
  - `registry.js`: `PMLM` skill and unit registry.
  - `validate.js`: content checks shared by the checker and the in-game self-test.
  - `grade1.js` … `grade9.js`: lessons and question generators, 201 skills. The format is in `src/CONTRACT.md`.
  - `visuals.js`: rich-text markup and 26 SVG teaching pictures.
  - `fx.js`: themes (Space, Ocean, Jungle, Candy), world backgrounds, particles, Web Audio sounds and music, and the mechanical key sound `Sfx.key`.
  - `engine.js`: state and storage, rounds and mastery, wishes, parent area, family accounts (`Sync`), all screens.
  - `shell.html`: markup and CSS. Each theme is a full token set on `:root[data-world=…]`. Every button is a "keycap" driven by `--face` / `--d`.
- `build.py` inlines `src/` into `index.html` and `build/artifact.html`, and stamps `BUILD` (shown in Parents and per device).
- `firestore.rules`: the database security rules. **Not auto-deployed.** After changing them, the owner pastes the file into Firebase console → Firestore → Rules → Publish.
- `tools/check-content.mjs`: content checker. `tools/rules-test/`: rules tests in the Firestore emulator. `tools/mock-firebase.js` and `tools/make-synctest.py`: an in-memory Firebase stand-in for testing family-account flows.

## Commands
Run these from the repo root.
- **Build:** `python3 build.py`
- **Check one grade's content:** `node tools/check-content.mjs src/grade6.js`. Add `--samples 3` to read questions, or list all grade files together.
- **Local preview:** `python3 -m http.server 8765 --bind 127.0.0.1`, then open `http://localhost:8765/index.html`.
- **In-game self-test:** open `index.html#selftest`, then read `window.__selftest`. It must show 201 skills and 0 problems.
- **Family-account flow tests:** `python3 tools/make-synctest.py` writes `build/synctest.html`, which uses the mock backend. Each "device" is a localStorage snapshot and the mock "server" lives in sessionStorage.
- **Rules tests:** run `cd tools/rules-test && npm install && npm run emulator` in one terminal, then `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm test`. Needs Java (Homebrew `openjdk`).
- **Deploy:** commit, then `git push`. Pages updates in 1–2 minutes. Confirm with `curl -s https://rendorf.github.io/play-more-learn-more/ | grep "const BUILD"`. Children's devices must reload to get it.

## How things work
- **Progress:** stored in `localStorage` key `pmlm.v1`, plus Firebase sync when signed in.
- **Mastery:** 8 of the last 10 answers right first time, on 2 different days. Grade % = mastered skills ÷ skills.
- **Wishes:** unlock at 25, 50, 75 and 100%. The parent grants them behind a PIN.
- **Rounds:** practice rounds are 10 questions. Wrong answers escalate: nudge hint → worked step → the answer, then the question goes to the Fix-it queue. Every skill can be practised at any time; boss battles need a star on every skill in their unit.
- **Family accounts (Firebase project `playmorelearnmore`; Email/Password, Google and Anonymous sign-in):**
  - Parents log in with email/password or Google; the first login creates `families/{uid}`.
  - A child's device joins with a link code (`codes/{code}`, 30 minutes, server-timed) through anonymous auth and becomes `families/{fid}/devices/{uid}`.
  - Each player is `families/{fid}/players/{id}` (`data` = JSON, `updatedAt`). Newest `updatedAt` wins. `Sync.track()` runs inside `save()` and stamps changed players.
  - The shared doc holds the PIN, money symbol, player order and a `deleted` map. Which player is active stays per device.
  - When a device joins, the family's PIN and settings win, and a same-name-and-grade child prompts "Is this the same …?" (combine).
- **Combine players** (`combineProfiles`) keeps the best record per skill. `state.aliases` maps removed ids so later backup codes update the kept player.
- **Failed questions:** if a skill's questions can't be made on a device, the child sees "didn't load", and a note goes to `player.diag` (synced) with the user agent and `BUILD`.

## Conventions and gotchas
- **Older tablets:** avoid `:is()` and other very new CSS/JS features. A dropped selector list silently unstyles everything. `color-mix` is already used, with background-color fallbacks.
- **Question generators** must never return invalid questions. Run the checker after any content change; it catches format problems only, so read samples for maths correctness.
- **Never test against the live family data.** Use the local preview (not signed in) or the mock. Don't create accounts in the owner's Firebase project.
- **Firebase rules changes** need the owner to republish them in the console. Say so whenever `firestore.rules` changes.
- **Commit messages:** imperative subject line, then a short body explaining why.
