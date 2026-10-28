# Play More Learn More

A DopaDrill-style maths practice game for the Cambridge curriculum, Grades 1–9 (Primary Stages 1–6, Lower Secondary 7–9). Single-page, no framework, no server of its own.

- **Live:**
  - **Game:** https://play.pmlm.uk/. **Landing page ("How it works", for kids and grown-ups):** https://pmlm.uk/.
  - Both are one Cloudflare **Worker** with static files (not Pages; settings in `tools/deploy/wrangler.json`). `.github/workflows/deploy.yml` deploys it with `wrangler deploy` after the **Tests** workflow passes on `main` (secrets `CLOUDFLARE_API_TOKEN` with Workers Scripts → Edit, `CLOUDFLARE_ACCOUNT_ID`; repo variable `CF_WORKER_NAME`, or the older `CF_PAGES_PROJECT`). `worker/index.js` runs for `/` only: `welcome.html` for pmlm.uk, the game for every other host. The custom domains are set in the dashboard (no routes in `wrangler.json`).
  - The old address https://rendorf.github.io/play-more-learn-more/ (GitHub Pages, also from `main`) and pmlm.uk itself send each device to play.pmlm.uk with its progress (`src/move.js`); keep GitHub Pages running.
- **Repo:** https://github.com/Rendorf/play-more-learn-more (public: never commit personal or family details here; use `CLAUDE.local.md`, which is gitignored)
- **claude.ai copy:** https://claude.ai/artifact/UyznLuwo4usV7cnubQ75Tt. Publish `build/artifact.html` with the Artifact tool and pass this URL as `url`. That copy has no Firebase, because the artifact CSP blocks gstatic, so it uses the artifact `db` capability instead.

## Layout
- `src/` is the source; `index.html` is **generated**. Never edit `index.html` by hand.
  - `config.js`: Firebase web config (`PMLM_FIREBASE`; public by design), `PMLM_ENV`, feature switches `PMLM_FEATURES` and the reminder public key `PMLM_VAPID`. `config.preview.js` is the same for the preview copy (staging project).
  - `util.js`: `U` helpers for question generators.
  - `registry.js`: `PMLM` skill and unit registry.
  - `validate.js`: content checks shared by the checker and the in-game self-test.
  - `grade1.js` … `grade9.js`: lessons and question generators, 201 skills. The format is in `src/CONTRACT.md`.
  - `visuals.js`: rich-text markup and 26 SVG teaching pictures.
  - `fx.js`: themes (Space, Ocean, Jungle, Candy), world backgrounds, particles, Web Audio sound effects (`Sfx`; `Sfx.audio()` shares the audio clock with the music), and the mechanical key sound `Sfx.key`.
  - `music.js`: background music composed live with Web Audio (`Music`): a song per world and four moods, each played with the world's instruments. `compose()`/`bar()` are pure and unit-tested.
  - `board.js`: leaderboard nicknames, ISO weeks, active minutes, ranking and the crowd of made-up players (`Board`, pure).
  - `reminders.js`: reminder messages and when to send one (`PMLM_REMINDERS`, pure; also loaded by the sender).
  - `online.js`: family-test extras over Firebase REST with its own anonymous sign-in (`Online`): stats events, feedback, leaderboard docs, push subscriptions, invite links (`Online.invite`), Home Screen install. Separate from `Sync`.
  - `analytics.js`: Google Analytics (`Analytics`, `PMLM_GA` in config.js) for the landing page and the game, on pmlm.uk and play.pmlm.uk only. Cookieless (Consent Mode) until a grown-up allows cookies; advertising off; game events without ids. `?gatest=1` runs it anywhere for tests.
  - `engine.js`: state and storage, rounds and mastery, wishes, parent area, family accounts (`Sync`), the Top tab, all screens.
  - `stats.html`: the owner's dashboard (build.py writes the root `stats.html`).
  - `landing.html` + `landing.js`: the landing page (build.py writes `welcome.html`). Before drawing, `Landing.decide()` moves a device that played on pmlm.uk on to play.pmlm.uk, gives an iPhone/iPad Home Screen app a progress code, or shows the page. Only a shown page starts Google Analytics and its cookie banner (never the moving or code panels). Its pictures are real game screenshots in `landing/`, made by `cd tests && npm run shots` (made-up players, local build only).
  - `shell.html`: markup and CSS. Each theme is a full token set on `:root[data-world=…]`. Every button is a "keycap" driven by `--face` / `--d`.
- `build.py` inlines `src/` into `index.html`, `stats.html`, `welcome.html`, `manifest.webmanifest` and `build/artifact.html`, and stamps `BUILD` (shown in Parents and per device). `--preview` builds `build/preview/`; `--check` fails if the generated files are stale or a landing picture is missing or over 200 KB.
- `worker/index.js`: the Cloudflare Worker's code, for `/` only (host routing). `404.html`: what a mistyped path gets (`not_found_handling`). `tools/deploy/`: pinned wrangler, `wrangler.json` (the Worker's settings), `stage.sh` (only the served files go up), `smoke.sh` (local `wrangler dev` check, also run before every deploy), `check-live.sh` (after a live deploy).
- `sw.js`: push-only service worker (no caching). `icons/`: app icons from `icons/icon.svg` (`node tools/make-icons.mjs`).
- `firestore.rules`: the database security rules. **Not auto-deployed.** After changing them, the owner pastes the file into Firebase console → Firestore → Rules → Publish.
- `tools/check-content.mjs`: content checker. `tools/rules-test/`: rules tests in the Firestore emulator. `tools/mock-firebase.js` and `tools/make-synctest.py`: an in-memory Firebase stand-in for testing family-account flows.
- `tools/admin/`: owner tools with a service account: `send-reminders.mjs` (hourly via `.github/workflows/reminders.yml`), `backup-firestore.mjs`, `setup-push.mjs`. `tools/deploy-preview.sh` publishes the preview to `Rendorf/pmlm-preview`.
- `docs/`: product, technology and design documentation (index in `docs/README.md`). Update the matching doc when a change alters behaviour, data or design; `docs/product/curriculum-map.md` is generated (`node tools/make-curriculum-map.mjs`).
- `tests/`: `run-all.sh` runs every check (also in `.github/workflows/test.yml`); unit tests, Playwright browser tests (`tests/e2e/`) and saved progress from the live version (`tests/fixtures/`).

## Commands
Run these from the repo root.
- **Build:** `python3 build.py`
- **Check one grade's content:** `node tools/check-content.mjs src/grade6.js`. Add `--samples 3` to read questions, or list all grade files together.
- **Local preview:** `python3 -m http.server 8765 --bind 127.0.0.1`, then open `http://localhost:8765/index.html`. Online extras are off on localhost; add `?emu=1` with the emulators running (`cd tests && npx firebase emulators:start --project demo-pmlm --config ../firebase.json --only auth,firestore`).
- **All checks before merging:** `tests/run-all.sh` (Java via Homebrew `openjdk`). One area: `cd tests && npm run unit`, or `npm run e2e -- -g leaderboard`.
- **In-game self-test:** open `index.html#selftest`, then read `window.__selftest`. It must show 201 skills and 0 problems.
- **Family-account flow tests:** `python3 tools/make-synctest.py` writes `build/synctest.html`, which uses the mock backend. Each "device" is a localStorage snapshot and the mock "server" lives in sessionStorage.
- **Rules tests:** run `cd tools/rules-test && npm install && npm run emulator` in one terminal, then `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm test`. Needs Java (Homebrew `openjdk`).
- **Deploy:** `main` is protected: nobody can push to it directly. Work on a branch, `git push -u origin <branch>`, open a pull request (`gh pr create`), and turn on auto-merge (`gh pr merge --auto --merge`). It merges once the **test** check (`tests/run-all.sh`) passes on a branch that is up to date with `main` (use "Update branch" if `main` moved). GitHub Pages updates 1–2 minutes later; the **Deploy** workflow publishes play.pmlm.uk and pmlm.uk after the Tests run on `main` (it checks both itself). Confirm with `curl -s https://play.pmlm.uk/ | grep "const BUILD"`. Children's devices must reload to get it. Label a pull request `preview` to upload its version to the Worker without deploying it (it proves the token and name; with workers.dev on it also gets a preview address: open its game only with `#debug`, since workers.dev isn't localhost and online extras would write to the live project). Rollback: Cloudflare → the Worker → Deployments → Rollback.

## How things work
- **Progress:** stored in `localStorage` key `pmlm.v1`, plus Firebase sync when signed in.
- **Mastery:** 8 of the last 10 answers right first time, on 2 different days. Grade % = mastered skills ÷ skills.
- **Wishes:** unlock at 25, 50, 75 and 100%. The parent grants them behind a PIN.
- **Rounds:** practice rounds are 10 questions. Wrong answers escalate: nudge hint → worked step → the answer, then the question goes to the Fix-it queue. Every skill can be practised at any time; boss battles need a star on every skill in their unit.
- **Family accounts (Firebase project `playmorelearnmore`; Email/Password, Google and Anonymous sign-in):**
  - Parents log in with email/password or Google; the first login creates `families/{uid}`.
  - A child's device joins with a link code (`codes/{code}`, 30 minutes, server-timed) through anonymous auth and becomes `families/{fid}/devices/{uid}`.
  - Each player is `families/{fid}/players/{id}` (`data` = JSON, `updatedAt`). **More progress wins** (`src/merge.js`: answers, then rounds), then the newer `updatedAt`. Newer grown-up edits are carried over. `Sync.track()` runs inside `save()` and stamps changed players.
  - **Never silent:**
    - every Sync read and write has a 15 s timeout, and two stuck answers switch the page to REST mode (the same documents over HTTPS, polled every 20 s);
    - ⚠️ in the top bar means changes have been unsaved for 3 minutes;
    - the Family account card has "Last saved online" and Save now;
    - a null sign-in on a linked device asks for re-linking instead of quietly stopping.
    See `docs/technology/decisions/0006-*`.
  - **Device lock:** a parent sets `devices/{uid}.player` (Parents → Devices → Plays as). The device then plays only as that child (`state.lock`), and the PIN unlocks it until the game closes.
  - **Bug reports:** 🐞 in the Me tab and Parents, plus a pop-up when something breaks (errors, saving stuck, a question failing; never mid-round). They're sent as `feedback` with `kind: 'bug'` and the game's diagnostics (`Diag.log()`, `Sync.health()`), and appear on stats.html.
  - `?emu=1` also points family sync at the local emulators (`tests/e2e/family.spec.mjs`).
  - The shared doc holds the PIN, money symbol, player order and a `deleted` map. Which player is active stays per device.
  - When a device joins, the family's PIN and settings win, and a same-name-and-grade child prompts "Is this the same …?" (combine).
- **Combine players** (`combineProfiles`) keeps the best record per skill. `state.aliases` maps removed ids so later backup codes update the kept player.
- **Daily goal and streak:**
  - **Real rounds:** a round counts towards the day if it ends normally with 5 or more questions answered (or is the 60-second challenge). Try-it rounds and leaving early don't count.
  - **Day done:** the family's `dailyGoal` (1–3, in the shared doc) of real rounds marks the day done and grows `p.streak`. Each day's rounds, minutes, new stars and questions are logged in `p.days`, pruned to 120 days.
  - **Missed days:** covered by 🧊 freezes (`p.streak.freezes`, at most 2: one earned every 7 days, bought for 30 coins, or won from the chest) when the child next meets the goal. Otherwise the streak restarts.
  - **Display:** the chip shows `liveStreak()`.
  - **Prizes:** milestones at 3/7/14/30/50/100 days give coins, and 7/30/100 also give a hat.
  - **Streak wishes:** `p.streakWishes` count days in a row from when the parent saved them.
- **Daily rewards:**
  - **Chest:** opens once per day after the day is done (coins, a lucky sticker, a freeze, or a rare chest-only item).
  - **Pet** (`p.pet`): grows with total days done, never shrinks, and looks sleepy after a missed day.
  - **Sticker album:** a sticker per mastered skill, unit pages worth +30, and a 24-sticker lucky page.
  - **Levels:** come from brain power; level L needs 750·L·(L−1).
- **Family team goal** (`state.team`, in the shared doc): every player's real rounds this week (Monday to Sunday) fill one bar. Each child sees the celebration once per week (`p.teamSeen`).
- **Lazy defaults:** reading a player never writes defaults into it, so looking at a sibling's data can't make their copy look newer. Only real events create the new fields.
- **Debug clock:** in `#debug`, Parents → Debug has "Next day ⏭" (a day shift kept in sessionStorage) and "Play a perfect round", and `window.__pmlm` exposes the state for testing.
- **Failed questions:** if a skill's questions can't be made on a device, the child sees "didn't load", and a note goes to `player.diag` (synced) with the user agent and `BUILD`, and a `problem` stats event.
- **Google Analytics (`src/analytics.js`):** `stat()` in engine.js sends each stats event to `Online` and, through `Analytics.track()`, to Google with only the fields in `Analytics.EVENTS` (never `p`, `d`, `msg` or names). Screens go as page views `/screen/<tab or screen>`. Consent: the cookie `pmlm_analytics=granted|denied` on `.pmlm.uk`, set by the landing page's banner or Parents → Settings → Allow Google Analytics cookies; children are never asked. Turning play stats off stops it in the game. `tests/e2e/analytics.spec.mjs` reads `window.dataLayer` with Google's script stubbed.
- **Family test extras (`Online`):** collections `events` and `feedback` (create only), `leaderboard/{pid}_{uid}` (owner writes; readers keep the newest doc per pid), `push/{uid}`, and `admins/{uid}` (written in the console; gates reading stats). Queue in `pmlm.q`. Off on localhost without `?emu=1`, in `#debug`/`#selftest` and in the artifact.
- **Leaderboard and reminder fields** follow the lazy-defaults rule: `stats.active`, `week {id, pts, secs, q, mst}`, `board` ('nick' | 'name' | 'hidden') and `nickSeed` are only written by a played round or a grown-up's choice. Older versions keep them untouched; `tests/e2e/progress.spec.mjs` checks this.
- **The crowd (`Board.crowd`, `PMLM_FEATURES.crowd`):** made-up players on the Top tab, generated on the device from the date, so every device shows the same ones each day (2–4 join daily; ids `zc…`). They carry levels, not numbers: `Board.rows(docs, opts, crowd)` scales them to the real players in each view (about the 25th percentile), caps them below the best, and adds none to a view without a real player. They join only a board that loaded, and are never stored or sent.
- **Background music (`Music`):**
  - **Styles:** a style (`theme` = the world's own song: Starhop, Island Hop, Vine Swing, Sugar Rush; or `lofi`, `calm`, `adventure`, `party`) is arranged for the current world. The world sets the key, the lead and chord instruments, the percussion and the ambience.
  - **Playback:** it starts on the first tap or key press and plays everywhere at one level, continuously (re-renders never restart it). Changing world or style crossfades.
  - **Scenes:** `setScene('round')` adds layers with the combo (`setEnergy`, 0–4), and `'boss'` starts at energy 2 with more drums.
  - **Other behaviour:** celebrations `duck()` it for a moment. It pauses while the page is hidden.
  - **Saved choices:** each child's pick is `p.music` (optional, written only when they pick). The device's `state.settings.music` is the on/off switch ("Background music" in Parents) and `musicVol` (0–100, default 50) the volume. Sliders are in the Me tab and in Parents.
  - **Sound check:** `Music.render()` renders a song offline for the loudness check in `tests/e2e/music.spec.mjs`.
- **Invite a friend:**
  - **Server records:** `invites/{code}` (6 characters, owned by the inviting device's `Online` account, one per player per device; the code is kept in `pmlm.inv`). `referred/{uid}` counts a new device for one invite only. `invites/{code}/friends/{uid}` holds the friend's `name`, `joined` and `played` (written by the friend) and `rewarded` (set once by the owner, after `played`).
  - **Opening a link:** `?invite=` is read at boot and removed from the address bar. It only counts on a device with no players; the referral state lives in `pmlm.ref`.
  - **Rewards:** the friend's first real round gives +50 (`INVITE_GIFT`). `collectInvites()` on the inviting device pays +100 (`INVITE_COINS`) per friend, up to 10 (`INVITE_MAX`), into `p.inviteRewards`.
  - **Parents' view:** `p.friends` is a synced summary for parents.
  - **Switches and stats:** `state.settings.invites === false` hides it. Stats events have `type: 'invite'` with `mode` share/open/join/play/reward.
- **Preview copy:** `PMLM_ENV = 'preview'` switches every localStorage key to `pmlm-preview.` (it shares the rendorf.github.io origin with the old address).
- **Moving to play.pmlm.uk (`src/move.js`, `PMLM_MOVE_TO`):** browsers keep progress per address. The old addresses are rendorf.github.io/play-more-learn-more (the game) and pmlm.uk (the landing page, which served the game until Oct 2026).
  - Both first fetch `https://play.pmlm.uk/move.json` (`Access-Control-Allow-Origin: *` in `_headers`, so it only passes once play.pmlm.uk serves this game), then `location.replace` to `play.pmlm.uk/#move=<gzip+base64url of Move.payload()>` = `{state, family, push}` read straight from storage. A device with no players is just forwarded.
  - play.pmlm.uk merges it like a backup code (`combineProfiles(…, false)`, skipping players in `state.deleted`), remembers it in `state.movedFrom`, sets `pmlm.sync` when the device was in a family (so the status says "link again"), and clears the fragment. Sign-ins don't travel: parents log in again, devices re-link, "Plays as" is set again.
  - The landing page keeps pmlm.uk's copy, marks the move in `pmlm.moved`, and turns off that address's push subscription. Home Screen apps on iPhone/iPad keep their own storage, so the landing page (or the old game's Parents → Move) shows **Copy progress code**, and the new icon's "Moving from the old app?" takes it.
  - Tests: `tests/e2e/move.spec.mjs` and `landing.spec.mjs` use 127.0.0.1 as the old address and localhost as the new one (`?moveto=`); `unit/landing.test.mjs` covers every decision.

## Conventions and gotchas
- **Older tablets:** avoid `:is()` and other very new CSS/JS features. A dropped selector list silently unstyles everything. `color-mix` is already used, with background-color fallbacks.
- **Question generators** must never return invalid questions. Run the checker after any content change; it catches format problems only, so read samples for maths correctness.
- **Never test against the live family data.** Use the local preview (not signed in), the emulators (`?emu=1`) or the mock. Don't create accounts in the owner's Firebase project.
- **Saved progress is sacred.** Never rename or drop fields in `pmlm.v1` or player docs, never change `STORE_KEY` or `v`; only add optional fields. Run `tests/run-all.sh` before every merge.
- **Firebase rules changes** need the owner to republish them in the console. Say so whenever `firestore.rules` changes.
- **Port 8766:** the browser tests reuse any server already on 8766, even one serving another checkout. If another worktree's server is there, the tests run against the wrong build: stop it, or run Playwright with a config on another port.
- **Commit messages:** imperative subject line, then a short body explaining why.
