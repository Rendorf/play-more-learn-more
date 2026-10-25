# Play More Learn More

A free, playful maths practice game for the Cambridge curriculum, Grades 1–9 (Primary Stages 1–6 and Lower Secondary Stages 7–9).

**Play it:** open `index.html` in any browser, or visit the GitHub Pages site for this repository.

- Short lessons with pictures, then practice with hints that get more helpful after each try
- Combo streaks with escalating sound and effects, boss battles, daily quests, coins and trophies
- Four worlds to choose from: Space, Ocean, Jungle and Candy
- A parent area behind a PIN: set wishes that unlock at 25%, 50%, 75% and 100% of a grade, see a progress report, and change settings
- Read-aloud button for younger players
- Works offline. Progress is saved in the browser on each device (use the backup code in the parent area to move it)

Everything is in the single `index.html` file; there is no server and nothing is sent anywhere.

## Editing the game

`index.html` is generated, so edit the files in `src/` and rebuild it.

| Path | What it holds |
|---|---|
| `src/grade1.js` … `src/grade9.js` | Lessons and question generators for each Cambridge stage |
| `src/CONTRACT.md` | The format for skills, questions, text markup and pictures |
| `src/engine.js` | Screens, rounds, mastery, wishes and the parent area |
| `src/fx.js` | Themes, backgrounds, celebration effects and sound |
| `src/visuals.js` | The SVG teaching pictures |
| `src/shell.html` | Page markup and styles |
| `tools/check-content.mjs` | Runs every question generator many times and reports problems |

After changing a grade file, check it, rebuild, and push. GitHub Pages updates the live site within a minute or two.

```bash
node tools/check-content.mjs src/grade6.js
```

```bash
python3 build.py
```

```bash
git add -A && git commit -m "Describe the change" && git push
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

The web config is public by design. The rules make sure only a family's parents and linked devices can read or write that family's data, link codes expire (15 minutes for devices, 24 hours for parent invites), and codes can't be listed or guessed in bulk.

### Testing the rules

`tools/rules-test` checks `firestore.rules` in Google's Firestore emulator (needs Java 11 or newer). Install once, start the emulator in one terminal, then run the tests in another:

```bash
cd tools/rules-test && npm install
```

```bash
cd tools/rules-test && npm run emulator
```

```bash
cd tools/rules-test && FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm test
```
