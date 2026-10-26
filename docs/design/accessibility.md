# Accessibility

**Who this is for:** the owner and designers deciding what to fix next, developers making changes, and schools or partners asking how the game supports different learners.

**Last checked against:** BUILD 2026-10-25 18:32 UTC.

This page lists what the game does today, measures it, and names the gaps with a suggested fix for each. The checks were made by reading the code (`src/shell.html`, `src/engine.js`, `src/fx.js`, `src/visuals.js`) and computing contrast from the colour tokens; they have not been tested with a screen reader on a real device.

## Summary

| Area | Today | Status |
|---|---|---|
| Read aloud | 🔊 on questions and lesson cards, British English, maths read as words | Good, partial coverage |
| Contrast, dark worlds | Body and button text well above 4.5:1 | Good |
| Contrast, Candy | Several text colours below 4.5:1 | **Gap** |
| Tap targets | Main controls 52–64 px; some icons 36–40 px | Mostly good |
| Keyboard | Full answer entry in rounds and PIN; focus ring | Partial |
| Screen readers | Labels on icon buttons; live regions for feedback | **Gaps** (pictures, dialogs, answer boxes) |
| Reduced motion | Respected in CSS and canvas | Good |
| Sound off | One-tap mute; separate settings | Good |
| Time limits | Only in optional modes | Good |

## Read aloud

- A 🔊 button (`aria-label="Read aloud"`) sits on every question card and lesson card. It only shows when the browser has speech (`speechSynthesis`).
- Voice: British English (`en-GB`), a little slower (rate 0.88) and slightly higher (pitch 1.05).
- For choice questions it reads the options too: "… Is it: 12, or 15, or 21?"
- Maths markup is turned into words by `spoken()` in `src/engine.js`:

| On screen | Spoken |
|---|---|
| `{3/4}` | "3 quarters" (halves to twelfths, and hundredths; otherwise "3 over 7") |
| `x^{2}`, `x^{3}`, `10^{−3}` | "x squared", "x cubed", "10 to the power −3" |
| `0.~{3}` | "0.3 recurring" |
| `−5` / `8 − 3` | "negative 5" / "8 minus 3" |
| `×`, `÷`, `=`, `<`, `>`, `≤`, `≥` | "times", "divided by", "equals", "is less than", … |
| `□` | "what number" |
| `°`, `%`, `√` | "degrees", "percent", "square root of" |

- Reading stops when the next question appears.

## Contrast by world

WCAG 2.2 AA asks for **4.5:1** for normal text and **3:1** for large text (24 px, or 18.7 px bold) and for UI parts such as focus rings. Ratios below are for the flat token colours; button faces have a light gradient, so real values vary a little.

| Text on background (where it is used) | Space | Ocean | Jungle | Candy |
|---|---|---|---|---|
| `--ink` on `--panel` (body text on cards) | 14.6 | 11.3 | 12.5 | 15.2 |
| `--ink` on `--panel2` (default buttons, keys) | 11.7 | 8.3 | 9.4 | 14.2 |
| `--muted` on `--panel` (secondary text) | 7.5 | 6.7 | 7.5 | 5.1 |
| `--muted` on `--panel2` (muted text on raised items and stat tiles) | 6.1 | 4.9 | 5.6 | 4.7 |
| `--accent-ink` on `--accent` (primary buttons) | 11.2 | 9.7 | 11.4 | **3.0** |
| `--go-ink` on `--go` (go buttons, Check ✓ key, right choice) | 10.1 | 11.0 | 11.2 | **2.6** |
| `--go` on `--panel` ("Correct!" feedback text) | 10.2 | 8.5 | 9.5 | **2.6** |
| `--oops` on `--panel` (wrong feedback, PIN errors) | 7.0 | 5.2 | 6.1 | **3.9** |
| `--sky` on `--panel` (links, focus ring) | 9.7 | 8.2 | 8.9 | **2.9** |
| `--accent` on `--panel` (coin rewards, scores, leaderboard values) | 11.3 | 6.8 | 9.4 | **3.0** |
| `#fff` on `--pop` (hot combo chip) | **2.5** | **2.1** | **2.5** | 4.2 |
| `#2a0006` on `--oops` (wrong choice, delete button) | 8.2 | 8.3 | 8.7 | 4.9 |

**Bold** = below AA for normal text. Most of these are bold display text of 18–28 px, so some pass the 3:1 large-text rule, but the Candy green (2.6) and the hot combo chip (2.1–2.5) fail even that.

## Tap targets

| Control | Size | Notes |
|---|---|---|
| `.btn` | min 52 px tall | Main actions |
| Keypad `.k` | 58 px (46 px on short screens, 52 px on narrow, 64 px on tall) | |
| Answer choices `.choice` | 64 px (54 px on short screens) | |
| Map nodes | 78 px circles (boss 92 px) | |
| Grade picker | 44 px tall; 9 buttons share the row | About 34 px wide on a 375 px phone |
| `.btn.small`, leaderboard filters | 40 px | |
| `.iconbtn` (✕, 🔊 mute, ↻) | 40 × 40 px | |
| 🔊 read aloud | **36 × 36 px** | Smallest control |
| `.link` ("Why?", "Forgot the PIN?", "Undo") | text height + 4 px padding | |

All controls pass WCAG 2.5.8 (24 px). Several are under the 44 px that Apple and most children's design guides recommend.

## Keyboard

- **In a round:** digits type into the answer box; `.` or `,` adds a decimal point; `-` toggles minus; Backspace deletes; Enter checks; Tab, `/` or arrow keys move between boxes (fractions and coordinates; `,` moves from x to y). For choice questions, keys **1–5** pick an option. After an answer, Enter or Space goes to the next question.
- **PIN screen:** digit keys enter the PIN.
- **Focus ring:** `:focus-visible` draws a 3 px `--sky` outline with 2 px offset on every focusable element.
- **Everything is a real `<button>`**, so Tab and Enter work across all screens.
- Key presses play the same key sound as tapping.

## Reduced motion and sound

- `prefers-reduced-motion: reduce` makes all CSS animations and transitions near-instant and non-looping, freezes the world background on one frame, cuts particles to about a sixth, and turns off screen shake. See [worlds-and-motion.md](worlds-and-motion.md).
- **Sound off:** 🔊 in the top bar mutes effects, music and key sounds together. Parents → Settings has separate switches for effects, music and button sound (Clicky, Thocky, Off).
- No sound plays before the first tap. No meaning is carried by sound alone: every sound has a visible change (ring colour, feedback text, health bar).

## Time limits

- Practice has **no timer** by default. The "Speed bonus" timer bar is off unless a grown-up switches it on, and running out costs nothing.
- The **⚡ Extra challenge** is a 60-second mode the child chooses; it is never required.
- Auto-advance after a right answer is 1.3 s; tapping "Why?" stops it.
- In **🧭 Find my level** and the 60-second challenge, a wrong answer shows "The answer is …" for only 1.8 s (1.2 s in the challenge) before moving on. Slow readers may miss it; these modes are optional.

## Known gaps and suggested fixes

Ordered roughly by impact on children.

| # | Gap | Who it affects | Suggested fix |
|---|---|---|---|
| 1 | **Candy contrast.** White on the pink primary button (3.0), white on green (2.6), green "Correct!" text (2.6), blue links and focus ring (2.9), pink coin and score text (3.0). | Everyone in Candy, especially low vision and bright sunlight | Darken Candy's tokens: `--accent` `#c2187a` (5.7:1 with white), `--go` `#08794f` (5.4:1), `--sky` `#0a6aa8` (5.8:1), `--oops` a little darker. Check the map and theme card still look sweet. |
| 2 | **Hot combo chip** is white on `--pop`: 2.1–2.5 in the dark worlds. | Everyone on a combo of 3+ | Use dark text (`--accent-ink` or the world's `--bg`) on `--pop`: about 6:1. |
| 3 | **Teaching pictures have no text alternative.** SVGs have `role="img"` but no `aria-label`, so a screen reader says "image" or nothing. Read aloud also skips the picture. | Blind and low-vision children; children who rely on read aloud | Generate a short label per type from the spec, for example "Clock" (not the time, if the time is the answer), "Number line from 0 to 20 with a jump of 5". Never reveal the answer. Add it to read aloud after the question. |
| 4 | **Read aloud covers only questions and lessons.** Hints, explanations, "The answer is …", results and celebration cards are not read. | Grades 1–3 and weak readers | Add 🔊 to the hint and explanation boxes, or read them automatically when the child has used read aloud in this round. |
| 5 | **Sheets and celebration cards don't manage focus.** Sheets have `role="dialog" aria-modal="true"` but focus stays behind them; there is no Escape to close; the celebration card is not a dialog and its "Yay!" button is not focused. | Keyboard and screen-reader users | On open, move focus to the sheet's first button (or the "Yay!" button), keep Tab inside, close on Escape, and return focus afterwards. Give `.celebrate` `role="dialog"` and a label from its title. |
| 6 | **Answer boxes are buttons named "Answer box".** The typed value is not announced, and there is no native input, so phone screen readers can't type an answer except with the on-screen keypad. | Screen-reader users | Label each box with its role and value, for example "Answer: 15", "Numerator: empty", and announce changes in a polite live region. |
| 7 | **Colour-only meaning in progress dots.** Round dots and mastery dots use green, yellow and red only. | Colour-blind children and parents | Add a small mark (✓, 💡, ✕) or a pattern, and a text summary for screen readers ("7 right first time, 2 with help, 1 missed"). |
| 8 | **Some states rely on `color-mix()` with no fallback.** The selected tab, map node star tiers, ghost buttons, the selected avatar tint and function keys set `--face` with `color-mix()`. On browsers without it (for example iOS before 16.2), these lose their colour and the keycap side shadow. | Children on older tablets | Add a plain fallback for each `--face` (a solid tint per world), the same way `.dcell.done` does. |
| 9 | **No focus ring on old Safari.** `:focus-visible` needs Safari 15.4+. | Keyboard users on older iPads | Add a plain `:focus` outline first, then hide it with `:focus:not(:focus-visible)` where supported. |
| 10 | **Small targets.** Read aloud is 36 px; icon buttons and small buttons 40 px; text links are tiny. | Younger children, motor difficulties | Raise `.iconbtn`, the read-aloud button and `.btn.small` to 44 px; give `.link` at least 8 px of padding. |
| 11 | **Grade picker and tabs miss roles.** `.gradepick` has `role="tablist"` but its buttons have no `role="tab"` or `aria-selected`; the bottom tabs have no `aria-current`. | Screen-reader users | Add `aria-pressed` (or `role="tab"` with `aria-selected`) to the grade buttons, and `aria-current="page"` to the active tab. |
| 12 | **Emoji-only buttons in the shop and wishes** have no labels (hats, avatars). | Screen-reader users | Add `aria-label` such as "Crown hat, 100 coins, not owned yet". |
| 13 | **Music ignores reduced motion.** Fast music at high combos can be overwhelming. | Children sensitive to sensory load | Consider starting with music off when reduced motion is on, or adding a "calm mode" that turns off music, shake and confetti together. |
| 14 | **Fonts need the internet.** Offline, Atkinson Hyperlegible falls back to the system font. | Offline players | Ship the two fonts with the game (they are open-licensed), or accept the fallback. |

## How to check a change

1. Look at the new screen in **Candy** and **Space** at least.
2. Compute the contrast of any new text colour pair against `--panel` and `--panel2` for all four worlds.
3. Turn on reduced motion in the operating system and replay the change.
4. Use only the keyboard: can you reach it, use it and leave it?
5. Make sure every icon-only button has an `aria-label`.
