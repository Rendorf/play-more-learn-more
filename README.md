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

## Online saving (optional)

With a free Firebase project, a parent can sign in with Google (Parents → Online saving) and every device signed in to that account shares the same players, wishes and PIN. Each player is stored as its own document, so two children playing at the same time on different devices don't overwrite each other. Without it, progress stays in each device's browser.

1. In the [Firebase console](https://console.firebase.google.com), create a project.
2. Authentication → Sign-in method → enable **Google**. Under Settings → Authorized domains, add the site's domain (for example `rendorf.github.io`).
3. Firestore Database → create a database in production mode, then publish these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

4. Project settings → Your apps → add a Web app, copy its `firebaseConfig`, paste it into `src/config.js` as `PMLM_FIREBASE`, then rebuild and push.

The web config is public by design; the rules above make sure each Google account can only read and write its own family's data.
