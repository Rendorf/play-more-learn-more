# Design principles

**Who this is for:** the owner, new designers, and partners, schools or investors who want to know what the product stands for and how that shows up in the game.

**Last checked against:** BUILD 2026-10-25 18:32 UTC.

These are the principles the game already follows. Each one points to the place in the code where you can see it. When a new idea conflicts with one of them, the principle wins unless the owner decides otherwise.

| # | Principle | In one line |
|---|---|---|
| 1 | Playful but readable | Arcade energy around the maths, never on top of it |
| 2 | Theme-neutral content | The maths is the same in every world; only the decoration changes |
| 3 | Kid-first | Big targets, short words, one idea per screen, mistakes are safe |
| 4 | Rewards never block learning | Every skill can be practised at any time; rewards only add |
| 5 | No dark patterns, no pay-to-win | Coins are earned, never bought; nothing is sold to children |
| 6 | Grown-up areas are calm and clear | Plain words, tables, behind a PIN |
| 7 | Works on older tablets and offline | Plain CSS, fallbacks, one file, no server needed |

## 1. Playful but readable

The game should feel like an arcade, but the question is always the easiest thing on screen to read.

- **Two fonts with two jobs.** Headings, buttons and numbers use the rounded display face *Baloo 2*. Body text uses *Atkinson Hyperlegible*, a face designed for readers with low vision (`src/shell.html`, `--font-display` and `--font-body`).
- **The question card is plain.** `.qcard` is a solid panel with a thin outline. The animated world sits behind the 760 px play column on its own canvas (`#world`, `z-index: 0`), and particles sit on a separate canvas that never takes clicks (`#fx`, `pointer-events: none`).
- **Excitement grows with skill, not with noise.** Effects scale with the combo tier (`comboTier` in `src/fx.js`: 3, 5, 8 and 12 in a row). A child who is struggling sees a calm screen; a child on a streak gets confetti, fireworks and faster music.
- **Numbers line up.** Scores and counters use `font-variant-numeric: tabular-nums` so they don't jump while counting.

## 2. Theme-neutral content

Four worlds (Space, Ocean, Jungle, Candy) share one curriculum.

- `src/CONTRACT.md` says unit names and lesson text **must be theme-neutral**: no "planet", "island" or "spaceship".
- The engine adds the theme on top: the map title ("Galaxy map", "Ocean map", "Jungle trail", "Candy road"), the main button label ("Blast off!", "Dive in!", "Let's go!", "Yum, go!"), the mascot, the boss creatures and the unit node style all come from `THEMES` in `src/fx.js`.
- Teaching pictures use colour tokens (`var(--ink)`, `var(--accent)`, `var(--panel2)`) so the same picture re-colours itself for each world (`src/visuals.js`).
- Result: a content author writes a skill once, and a child can switch world at any time without losing anything.

## 3. Kid-first

- **Big touch targets.** Main buttons are at least 52 px tall (`.btn`), answer keys 58 px (`.k`), answer choices 64 px (`.choice`). See [accessibility.md](accessibility.md) for the few smaller ones.
- **Every button feels like a real key.** Each control is a "keycap" that sinks when pressed and clicks like a mechanical keyboard (`Sfx.key`). The press starts on `pointerdown`, so a child gets feedback at once, even on a slow tablet.
- **Mistakes are safe.** A wrong answer gets "Not quite. Try again!" and a hint, not a red cross. After three tries the game shows the answer, explains it, and saves the question for the Fix-it queue so it comes back later.
- **Hints are free.** The 💡 Hint button is always there in practice; the mascot says "Hints are free. Use them!". A hint only means the answer doesn't count as "right first time" for mastery.
- **One idea per screen.** Lessons are 3–5 cards; a round is 10 questions; each question has one task (`CONTRACT.md`: "Keep it short; one idea").
- **No reading needed for the youngest.** A 🔊 button reads questions and lesson cards aloud in British English, with maths symbols turned into words (`spoken()` in `src/engine.js`).

## 4. Rewards never block learning

- **Every skill is open from day one.** The map has no locked skills. Only boss battles wait, and only until the child has one star on every skill in the unit.
- **Rewards only add.** Coins, stickers, hats, the pet and trophies never take progress away. The pet "never gets smaller" and looks sleepy, not sad, after a missed day (`petSleepy` in `src/engine.js`).
- **Streaks forgive.** Streak freezes (up to 2) cover missed days. One is earned every 7 days.
- **Wishes are real-world treats set by a grown-up.** They unlock from mastery (25, 50, 75 and 100% of a grade), not from coins, so the only way to a wish is learning.
- **Optional pressure only.** The speed timer is off by default and "nothing is lost" when it runs out; it only adds a bonus (Parents → Settings).

## 5. No dark patterns, no pay-to-win

- **There is nothing to buy with money.** Coins come only from playing: right answers, quests, streak milestones, the daily chest and invites.
- **Coins buy looks, not answers.** The shop sells avatars, hats and streak freezes. Nothing in the shop makes questions easier or skips mastery.
- **The leaderboard is private by default.** Children appear under a generated nickname ("Adjective Animal 12"), a grown-up can show the first name or hide the child (`board` field, Parents → Players).
- **Invites are fair and capped.** A friend gets coins only after finishing a real first round, and a child is paid for at most 10 friends. The welcome screen tells the friend "Your friend will see your player name."
- **Reminders back off.** At most one a day, only on days nobody on the device has played, then every 3rd day, then they stop after 14 days (`src/reminders.js`). They are off until a grown-up turns them on.
- **Stats are anonymous and can be switched off** in Parents → Settings.

## 6. Grown-up areas are calm and clear

- **Behind a PIN.** The Parents tab asks for a 4-digit PIN on children's devices. A parent's own login skips it.
- **Plain language and tables.** The weekly report and skill report are simple tables (`table.report`). Each setting has a one-line explanation in muted text, for example "Speed bonus (a timer bar; fast answers earn extra brain power, nothing is lost)".
- **No celebrations in the grown-up area**, apart from one confetti burst when a wish is marked as granted.
- **Errors say what to do next.** For example "That code no longer works. It has probably expired (codes last 30 minutes). Ask for a new one."
- **Risky actions ask first.** Delete player, reset progress, unlink a device and combine players each open a confirmation sheet that explains what stays and what goes.

## 7. Works on older tablets and offline

- **Plain CSS.** No `:is()` or other very new selectors. A comment in `src/shell.html` says "Plain selector lists keep older tablets working."
- **Colour fallbacks.** Where `color-mix()` paints a background, a solid `background` comes first (`.dcell.done`, `.dcell.frozen`, `.sticker.got`).
- **One file.** `build.py` inlines everything into `index.html`. The game plays offline; online extras are optional.
- **Graceful canvas.** `roundRect` is used only when the browser has it, and the world animation pauses when the tab is hidden.
- **Safe areas.** The side gutter is `max(16px, env(safe-area-inset-left))`, so the layout clears notches and rounded corners.

## How to use these principles

- In a design review, name the principle a change helps or hurts.
- When adding a feature, check it against 4 and 5 first: does it ever take something away from a child, or push them to spend or return?
- For colours and components, see [design-system.md](design-system.md). For words, see [voice-and-copy.md](voice-and-copy.md).
