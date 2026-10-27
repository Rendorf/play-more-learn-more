# Play More Learn More

A free, playful maths practice game for the Cambridge curriculum, Grades 1–9 (Primary Stages 1–6 and Lower Secondary Stages 7–9).

**Play it:** open `index.html` in any browser, or visit the GitHub Pages site for this repository.

- Short lessons with pictures, then practice with hints that get more helpful after each try
- Combo streaks with escalating sound and effects, boss battles, daily quests, coins and trophies
- Four worlds to choose from: Space, Ocean, Jungle and Candy
- A parent area behind a PIN: set wishes that unlock at 25%, 50%, 75% and 100% of a grade, see a progress report, and change settings
- Read-aloud button for younger players
- 🎵 Background music made by the game itself: each world has its own song, and children can switch to Lofi cozy, Calm focus, Adventure or Party (played with that world's instruments). It builds up with a combo, and has a volume control and an off switch
- 🏅 A leaderboard with fun nicknames: points, active minutes, skills mastered, streak, questions and first-try %, this week or all time, by grade
- 💌 Invite a friend: a child shares a link; when the friend finishes a first round, the friend gets 50 coins and the child 100 (for up to 10 friends)
- 🔔 Optional daily reminders, Duolingo style: a motivating message on days nobody has played yet
- A one-minute setup for grown-ups, Add to Home Screen help, and 🚩 on every question to report a problem
- Keeps working without internet once it is open (the page isn't stored for offline use, so the first load needs a connection). Progress is saved in the browser on each device (use the backup code in the parent area to move it)

The game is the single `index.html` file and, once open, plays the same without internet. The online parts are optional and use the game's Firebase project: family accounts, and for the friends-and-family test anonymous play stats, feedback, the leaderboard, reminders and invites (see [Family test extras](#family-test-extras)).

## Documentation

Product, technology and design documentation, for the team, new members, partners and schools, is in [`docs/`](docs/README.md).

## Editing the game

`index.html` is generated, so edit the files in `src/` and rebuild it.

| Path | What it holds |
|---|---|
| `src/grade1.js` … `src/grade9.js` | Lessons and question generators for each Cambridge stage |
| `src/CONTRACT.md` | The format for skills, questions, text markup and pictures |
| `src/engine.js` | Screens, rounds, mastery, wishes and the parent area |
| `src/fx.js` | Themes, backgrounds, celebration effects and sound effects |
| `src/music.js` | Background music, composed live with Web Audio: songs, moods, instruments and the player |
| `src/visuals.js` | The SVG teaching pictures |
| `src/shell.html` | Page markup and styles |
| `src/config.js` | Firebase settings, feature switches (`PMLM_FEATURES`) and the reminder public key |
| `src/config.preview.js` | The same for the preview copy (staging Firebase project) |
| `src/online.js` | Anonymous stats, feedback, leaderboard, reminder subscriptions and invite links (Firebase REST, own anonymous sign-in) |
| `src/board.js` | Leaderboard nicknames, weeks and ranking |
| `src/reminders.js` | Reminder messages and the rules for when to send one |
| `src/stats.html` | The test dashboard (built into `stats.html`) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Home Screen app and reminder notifications (`node tools/make-icons.mjs` redraws the icons) |
| `tools/check-content.mjs` | Runs every question generator many times and reports problems |
| `tools/admin/` | Owner tools: the reminder sender, database backup, reminder key setup |
| `tests/` | Everything that must pass before a change goes to `main` (`tests/run-all.sh`) |

After changing a grade file, check it, rebuild, and send it as a pull request. `main` is protected, so a change reaches the live site only through a pull request whose tests pass (see [Releasing safely](#releasing-safely)). GitHub Pages updates the live site a minute or two after the merge.

```bash
node tools/check-content.mjs src/grade6.js
```

```bash
python3 build.py
```

```bash
git switch -c my-change && git add -A && git commit -m "Describe the change" && git push -u origin my-change && gh pr create --fill && gh pr merge --auto --merge
```

Opening `index.html#selftest` in a browser runs the same checks across all grades inside the game, including drawing every picture.

## Family accounts (optional)

With a free Firebase project, all the children's progress is kept in one online database:

- **Parents** log in with email and password or with Google (Parents tab, or "Parent login" on the welcome screen). A parent sees every child's progress on any device and manages wishes, grades, players and linked devices. The Parents tab needs no PIN on a parent's own login.
- **A child's device** joins once with a link code. The parent taps **Link a child's device** in their dashboard, and the child types the 8-character code under **Link to my family**. Kids never see a parent password. A parent can unlink a device at any time.
- **A second parent** joins with an invite code (Devices and parents → Invite another parent).
- Each player is its own document, so two children playing at the same time on different devices don't overwrite each other. Play continues offline and uploads later.

Without a Firebase project, progress stays in each device's browser, and backup codes can bring players from one device to another.

### Setup

1. In the [Firebase console](https://console.firebase.google.com), create a project (Google Analytics can be off).
2. **Authentication → Sign-in method:** enable **Email/Password**, **Google** and **Anonymous**. Anonymous sign-in is what linked children's devices use.
3. **Authentication → Settings → Authorized domains:** add the site's domain (for example `rendorf.github.io`).
4. **Firestore Database:** create a database in production mode. On the **Rules** tab, paste the whole of [`firestore.rules`](firestore.rules) and publish.
5. **Project settings → Your apps:** add a Web app, copy its `firebaseConfig`, paste it into `src/config.js` as `PMLM_FIREBASE`, then rebuild and push.

The web config is public by design. The rules make sure only a family's parents and linked devices can read or write that family's data, link codes expire (30 minutes for devices, 24 hours for parent invites, timed by the server so a wrong device clock does not matter), and codes can't be listed or guessed in bulk.

### Testing the rules

`tools/rules-test` checks `firestore.rules` in Google's Firestore emulator (needs Java 21, the version the tests and CI use). Install once, start the emulator in one terminal, then run the tests in another:

```bash
cd tools/rules-test && npm install
```

```bash
cd tools/rules-test && npm run emulator
```

```bash
cd tools/rules-test && FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm test
```

## Family test extras

While friends and families try the game, these help us learn what works. Each can be switched off for everyone in `PMLM_FEATURES` (`src/config.js`), then rebuild and push.

- **Anonymous play stats:** each device sends small events (opened the game, new player with grade, lesson, round with counts and minutes, wish set or unlocked, a question that failed to load). They carry a random device id and the random player id, never names. Parents can switch it off under Parents → Settings. The `?src=` part of an invite link (for example `?src=ff1`) is remembered, so invite waves can be compared.
- **Feedback:** 🚩 on any question (with the question, the expected answer and what the child typed), and a "Tell us what you think" box in the Parents area.
- **Leaderboard (🏅 Top tab):** one entry per child per device in the `leaderboard` collection, with a generated nickname unless a grown-up picks "First name" or "Hidden" under Parents → Players. Minutes count active play only (at most 90 seconds per answered question). The weekly board starts every Monday.
- **Invite a friend (💌 on the Me tab):** a child shares a link with a random code (`?invite=K7PQ2M`), made on their device and owned by its anonymous account (`invites/{code}`).
  - A device with no players that opens the link is counted once (`referred/{uid}`). It reports in `invites/{code}/friends/{uid}` when the friend makes a player (with the player name) and finishes a first full round.
  - The friend's device then gives a 50-coin welcome gift. The inviting device pays 100 coins by setting `rewarded`, which the rules allow only once, for up to 10 friends.
  - Only the inviting device can read who came. Parents see a summary in the family card, synced with the child.
  - Grown-ups can switch it off under Parents → Settings. The funnel is on `stats.html`.
- **Bug reports:** 🐞 Report a problem (Me tab and Parents), and a pop-up when something breaks. Each report carries the game version, device, screen, the last taps and the family-saving status, with no names. They are listed on `stats.html`.
- **Stats dashboard:** `stats.html` on the live site. Sign in with Google. The first time it shows your account id: add a document with that id to an `admins` collection in the Firebase console (any field, for example `ok: true`) and reload.

### Daily reminders

A grown-up turns them on per device under Parents → Daily reminder and picks a time. On iPhone and iPad they work from the Home Screen app (iOS 16.4 or newer). Every hour `.github/workflows/reminders.yml` runs `tools/admin/send-reminders.mjs`, which sends a device its message only at the chosen time, only on days nobody on it has played yet, daily for 3 missed days, then every 3rd day, stopping after 14 days. The rules and messages are in `src/reminders.js`.

One-time setup (until then the reminder card is hidden and the hourly job does nothing):

```bash
cd tools/admin && npm ci && cd ../.. && node tools/admin/setup-push.mjs
```

That writes the public key into `src/config.js`, stores the private key as the GitHub secret `VAPID_PRIVATE_KEY` without showing it, and rebuilds. Then in the Firebase console → Project settings → Service accounts → Generate new private key, and store it:

```bash
gh secret set FIREBASE_SERVICE_ACCOUNT --repo Rendorf/play-more-learn-more < ~/Downloads/your-key-file.json
```

Delete the downloaded key file afterwards (or keep it in `~/.config/pmlm/live-service-account.json` for backups). To send yourself a test reminder: GitHub → Actions → Daily reminders → Run workflow, with your device id from the `push` collection. GitHub pauses scheduled jobs after 60 days without any change to the repository; re-enable it there if that happens.

## Tests

Everything that must pass before a change reaches `main`. GitHub runs it on every pull request (`.github/workflows/test.yml`); to run it yourself (Node 22, Python 3, Java 21):

```bash
tests/run-all.sh
```

1. Question content for all grades, and `index.html` / `stats.html` up to date with `src/`
2. Unit tests: leaderboard ranking, weeks, nicknames, reminder timing and back-off, the online module
3. Database rules in the Firestore emulator: the family-account rules and the new collections
4. Browser tests (Chromium, and WebKit for iPhone and iPad) against local Auth and Firestore emulators:
   - every existing flow: placement, lessons, practice, PIN, wishes, boss, fix-it, shop, themes, backup codes
   - **progress safety:** progress saved by the live version (`tests/fixtures/`) opens unchanged, playing only adds, rolling back keeps everything, old backup codes work, and the preview copy never touches real progress
   - **family sync across versions:** one device on the live version, one on the new version, same child, nothing lost
   - the new features, the game with no internet, the dashboard, phone and tablet layouts, the reminder sender and backup/restore

The browser tests never use the real Firebase project: `?emu=1` points the game at the local emulators, and family accounts are tested with `tools/mock-firebase.js`. `cd tests && npm run fixtures` refreshes the saved-progress fixtures from the live version.

## Releasing safely

1. Work on a branch and open a pull request; the template there has the full checklist.
2. **Preview on real phones** with a separate staging Firebase project, so real children's progress, the live leaderboard and live stats are never touched. One-time setup: create a Firebase project (for example `playmorelearnmore-staging`), turn on Email/Password, Google and Anonymous sign-in, add `rendorf.github.io` to its authorized domains, create the Firestore database, publish `firestore.rules`, and paste its web config into `src/config.preview.js`. For reminders on the preview: `node tools/admin/setup-push.mjs --preview`, and save its service-account key as `~/.config/pmlm/staging-service-account.json`. Then:
   ```bash
   tools/deploy-preview.sh
   ```
   It publishes `https://rendorf.github.io/pmlm-preview/` (red PREVIEW ribbon, "PMLM Preview" on the Home Screen). The preview keeps its own storage on the device. Send a test reminder there with `node tools/admin/send-reminders.mjs --env staging --only <device id>`.
3. **Before merging:** back up the live database (read-only; the file goes outside the repository):
   ```bash
   node tools/admin/backup-firestore.mjs --key ~/.config/pmlm/live-service-account.json
   ```
   then publish the new `firestore.rules` to the live project, and set up reminder keys if needed.
4. **Merge** only when the tests are green and the checklist is done, then check the live version: `curl -s https://rendorf.github.io/play-more-learn-more/ | grep "const BUILD"`.
5. **If something is wrong:** `git revert -m 1 <merge commit>` and push. The old version comes back in 1–2 minutes and keeps everyone's progress (the tests check this). Or switch off one feature in `PMLM_FEATURES`. `backup-firestore.mjs --restore <file> --yes` puts back database documents from a backup.
