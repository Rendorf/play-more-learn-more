# Voice and copy

**Who this is for:** anyone writing words for the game: content authors (lessons, hints, explanations), designers (buttons, messages) and the owner (reminders, grown-up text).

**Last checked against:** BUILD 2026-10-25 18:32 UTC.

The game talks to two audiences: **children** aged about 6 to 14, and **grown-ups** (parents, teachers). It uses one voice with two tones. Lesson and question rules come from [src/CONTRACT.md](../../src/CONTRACT.md); this page adds the UI and message rules.

## One voice, two tones

| | Children | Grown-ups |
|---|---|---|
| Feeling | Warm, excited, on their side | Calm, clear, respectful of their time |
| Sentence length | Very short. One idea. | Short. Explain the "why" in one line. |
| Exclamation marks | Yes, for wins and invitations | Rarely; only for real good news |
| Emoji | Often, as icons and for fun | As section icons on cards (📅, 🎁, ⚙️), not in sentences |
| Address | "you", the mascot speaks as a friend | "you" for the grown-up, the child by name |
| Where | Play, Wishes, Me, Top tabs, rounds, lessons, celebrations | Parents tab, setup sheets, login, errors about accounts |
| Word for adults | "a grown-up" | "parent", "grown-up" |

Both tones use British English: "maths", "colour", "practise" (verb, on the **▶ Practise** button) and "practice" (noun, "Start practice").

## Real examples from the game

### Children

| Moment | Copy |
|---|---|
| Welcome | "Hi! I'm Blip. Let's make maths fun, one combo at a time!" |
| Start of a round | "You can do it!", "Let's go!", "Brain on!", "Here we go!" |
| Right answer | "Yes! 🎉", "Nailed it!", "Brain power rising!", "You got it!", "Brilliant!" |
| On a streak (combo 5+) | "You're on fire! 🔥", "Unstoppable!", "Maths superstar!" |
| 1st wrong try | "Not quite. Try again!" + "Almost! Here is a clue." / "Mistakes help your brain grow!" |
| 2nd wrong try | "Nearly there. One more go!" + "Let's do the first step together." |
| 3rd wrong try | "The answer is …" + "That was a tricky one. Here is how it works." / "Now you know it! It will come back later so you can beat it." |
| Hint button | "Hints are free. Use them!" |
| Lesson cards | "Take your time.", "Read it twice if you like.", "Look at the picture.", "You can go back any time." |
| Simplest form | "Right value! Now write it in its simplest form." |
| Not enough coins | "You need 12 more 🪙. Answer questions to earn coins!" |
| Boss lost | "So close! Its health bar is low. Try again!" |
| Sleepy pet | "[pet] missed you! One round wakes it up." |
| Wish unlocked | "Wish unlocked!" … "Show a grown-up! 🎉" |
| Something broke | "Oops! … didn't load. … It's not your fault! Try another skill, and please tell a grown-up." |

### Grown-ups

| Moment | Copy |
|---|---|
| PIN | "The PIN keeps wishes and settings for grown-ups only." |
| Quick start | "A few quick things help [child] come back every day." |
| Wishes | "Small wishes unlock at 25%, 50% and 75% of the grade's skills mastered. The big wish unlocks at 100%." |
| Team goal | "All the children fill one bar together each week (Monday to Sunday), so they help each other instead of competing." |
| Settings | "Speed bonus (a timer bar; fast answers earn extra brain power, nothing is lost)" |
| Reminders | "A short, motivating message on days nobody on this device has played yet … At most one a day, and it backs off if the game isn't being played." |
| Delete | "This removes the player and all their progress and wishes on this device." |
| Reset | "Stars, mastery and mistakes for this grade go back to zero. Wishes stay." |
| Login errors | "That email or password is not right.", "Use a password with at least 6 characters." |
| Link code expired | "That code no longer works. It has probably expired (codes last 30 minutes). Ask for a new one." |
| Sync | "Offline. Changes will upload when the internet is back." |
| Privacy | "The game sends **anonymous** play stats … No names, no emails and nothing from backups. You can switch this off under Settings." |

## Patterns

- **Buttons are verbs or short answers.** "Start playing", "Add a wish", "Link this device", "Fight!", "Yay!", "Keep playing", "Not now", "Later".
- **Two-choice sheets put the safe choice clearly.** "Keep playing" is the primary button; "Leave" is a ghost button.
- **Confirmations say what stays as well as what goes.** "Progress stops saving online. The players stay on this device, and everything already saved stays in your family."
- **Errors say what to do next.** Never just "Error". Example: "Notifications are blocked for this game. Allow them in the browser or phone settings, then try again."
- **Numbers are specific.** "2 rounds to go today", "3 more days to the 7-day prize: +25 🪙 and the 🔥 hat."
- **Toasts are one line.** "PIN saved", "Wishes saved", "Thank you! We will check this question. 🚩"

## Lessons, hints and explanations

From `src/CONTRACT.md` and `src/validate.js`:

| Part | Rule |
|---|---|
| Audience | "Write for a child who finds maths hard." Short sentences. Friendly, never babyish for older grades. |
| Age | Grade N is about age N + 5. Grades 1–3: very simple words, small numbers at level 1, lots of pictures. |
| Theme | Unit names and lesson text must be theme-neutral: no "planet", "island", "spaceship". |
| Unit name | Plain, 22 characters or fewer, one emoji. |
| Skill | Title 26 characters or fewer, blurb 60 or fewer, one emoji. |
| Lesson | 3–5 cards: what the idea is → a picture → a tip or trick → a worked example with numbered steps (always the last card). |
| Question | Short; one idea. Vary the format: find the answer, find the missing number, spot the mistake, word problem. |
| Hints | Exactly two. **1. Nudge:** a gentle reminder of the method. **2. Worked step:** the first concrete step done for them, leaving the last step to the child. **Never give the final answer in a hint.** |
| Explanation | The full solution in 1–3 short sentences, **ending with the answer**. Shown after the 3rd wrong try and on "Why?". |
| Wrong options | Built from **real mistakes** (forgot to carry, added instead of multiplied, place-value slip), not random numbers. |
| Fairness | No trick questions or ambiguous answers. |
| Symbols | `×`, `÷` and `−` (the real minus sign); `□` for a missing number. Units in British spelling: centimetres, litres, metres. |
| Money | Use the family's chosen symbol (`ctx.currency`), never a fixed one. |

Example of the hint ladder for "□ + 7 = 15" (illustrative):

| Step | Text |
|---|---|
| Nudge | "Count on from 7 to 15, or take 7 away from 15." |
| Worked step | "15 − 7: take away 5 to get to 10 first." |
| Explanation | "15 − 7 = 8, so the missing number is **8**." |

Everything in a question, hint or explanation can be read aloud, so write it to sound right when spoken. The reader turns `{3/4}` into "3 quarters", `×` into "times", `□` into "what number" and `−5` into "negative 5".

## Reminder messages

Reminders are push notifications to a device, written in `src/reminders.js`. They speak to the child (a grown-up turned them on).

- **Shape:** an emoji and a short title, then one or two short sentences. Example: "🎁 So close!" / "Only 8% to go until your next wish. Master a skill today!"
- **Five groups**, chosen in this order:

| Group | When | Example |
|---|---|---|
| Streak | A streak of 2+ days is at risk | "🔥 Keep your streak alive!" / "Your 5-day streak is waiting. One quick round keeps it going!" |
| Wish | A wish is 15% or less away | "🎁 Your wish is waiting" / "Just 8% more and your wish unlocks. Shall we get closer?" |
| Comeback | 3 or more days without play | "👋 Welcome back any time" / "Your map, your coins and your boss battles are all still here." |
| Growth | Other days (alternates with playful) | "🧠 Brain gym time" / "Mistakes help your brain grow. Ready to try a few?" |
| Playful | Other days | "🔥 Combo challenge" / "How big a combo can you make today? Beat your best!" |

- **Rules:** never more than one a day; never on a day someone on the device already played; never the same message twice in a row; no names (only the device's avatars).
- **Growth lines** also appear on the Play tab as a daily tip in italics (the same line all day).
- Keep new messages **positive and specific**: invite, don't scold. Promise small effort ("Five minutes is all it takes").

## Words to use and avoid

| Prefer | Avoid | Why |
|---|---|---|
| "Not quite", "Almost!", "Nearly there" | "Wrong", "Fail", "Bad", "Incorrect" | A mistake is part of learning. (The `--oops` colour already says it.) |
| "Hints are free" | "Cheat", "Give up" | Asking for help is good. |
| "Tricky", "a challenge" (after a miss) | Calling a question "hard" or "difficult" before the child tries it | Don't set a child up to fail. Growth lines like "You can do hard things" are fine: they are about effort, not one question. |
| "a grown-up" | "your mum/dad" | Families differ. |
| "maths", "colour", "practise" (verb) | "math", "color", "practice" as a verb | Cambridge, British English. |
| Neutral words in content: "shape", "unit", "group" | "planet", "island", "spaceship", "candy" in lessons | Content must work in every world. |
| "Sleepy", "missed you" | "Sad", "dying", "hungry" for the pet | Rewards never punish. |
| Specific numbers | "Hurry!", "Last chance!", "Only today!" | No false urgency. |
| "Earn", "win", "unlock" for coins and items | "Buy now", prices in real money | Nothing in the game is sold for money. |
| The child's first name only, chosen by them | Surnames, ages, school names | Children's privacy. |

Some current copy is mildly loss-framed, for example the streak reminder "Don't let the fire go out!". Keep that kind of line rare and always paired with an easy next step.
