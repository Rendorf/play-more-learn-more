# Product specification

**Who this is for:** the owner and new team members who need to know exactly how each feature behaves, and partners or schools who want the detail.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

This page describes what is **shipped** today, as behaviour. The numbers come from the game's code. If the code and this page disagree, the code is right and this page needs fixing. For why things work this way, see [learning-design.md](learning-design.md). For how it is built, see the planned [technology/architecture.md](../technology/architecture.md) and [technology/data-model.md](../technology/data-model.md).

## Contents

1. [Players and screens](#1-players-and-screens)
2. [Placement: Find my level](#2-placement-find-my-level)
3. [Lessons and Try it](#3-lessons-and-try-it)
4. [Practice rounds and the hint ladder](#4-practice-rounds-and-the-hint-ladder)
5. [Mastery, stars and difficulty](#5-mastery-stars-and-difficulty)
6. [Fix-it](#6-fix-it)
7. [Boss battles](#7-boss-battles)
8. [The 60-second challenge](#8-the-60-second-challenge)
9. [Wishes](#9-wishes)
10. [Daily goal, streaks, freezes and milestones](#10-daily-goal-streaks-freezes-and-milestones)
11. [Rewards: chest, pet, stickers, levels, coins, shop, quests, trophies](#11-rewards)
12. [Family team goal](#12-family-team-goal)
13. [Family accounts and device linking](#13-family-accounts-and-device-linking)
14. [Leaderboard and nickname privacy](#14-leaderboard-and-nickname-privacy)
15. [Daily reminders](#15-daily-reminders)
16. [Invite a friend](#16-invite-a-friend)
17. [Feedback and the 🚩 button](#17-feedback-and-the--button)
18. [Parent area and PIN](#18-parent-area-and-pin)
19. [Themes, sound and read-aloud](#19-themes-sound-and-read-aloud)
20. [Offline, saving and backups](#20-offline-saving-and-backups)

---

## 1. Players and screens

- A device can hold several **players** (children). Each has a name (up to 16 characters), an avatar, a grade (1–9) and a world (theme).
- The first screen asks to **Add a player**. When the very first player is made on a device without a PIN, a **1-minute setup** sheet for grown-ups suggests: set a PIN, add a wish, put the game on the Home Screen, turn on a daily reminder.
- The game has four tabs: **Play** (the map), **Wishes**, **Me** (profile and shop), **Top** (leaderboard), plus the **Parents** area.
- The **Play** tab shows: the pet and this week's streak, the grade's progress ring, a suggested next skill, **Fix-it** and **Find my level** buttons, the next wish, the family goal, today's 3 quests, and the map of units and skills.
- The **suggested next skill** is, in order: a mastered skill not practised for 7 days (marked ↻ "refresh"); else the first skill with no star; else the first skill not mastered.
- **Every skill can be practised at any time.** Nothing on the map is locked except boss battles.

## 2. Placement: Find my level

- One question from **every skill** in the grade, at level 2.
- No hints. A wrong answer shows the right answer and moves on.
- A skill answered right first time gets **1 star** and starts at **level 2**, so a child can skip ahead.
- Placement answers don't count towards mastery.

## 3. Lessons and Try it

- Every skill has a lesson of **3–5 cards** with pictures. The last card is a worked example, step by step.
- After the lesson the child does **Try it**: 2 easy (level 1) questions. Try it marks the lesson as done but doesn't count towards mastery, stats or the daily goal.

## 4. Practice rounds and the hint ladder

**A practice round is 10 questions**, mostly from the chosen skill. Mixed in:

- up to 1 earlier mistake from the same skill and up to 1 from another skill (from the Fix-it queue)
- 1 question from another skill in the grade that already has a star (spaced review)

**When a child answers wrong**, help grows step by step:

| Try | What happens |
|---|---|
| 1st wrong | "Not quite. Try again!" and a **nudge** hint (💡: a reminder of the method) |
| 2nd wrong | "Nearly there" and a **worked step** (👣: the first step done, last step left to the child) |
| 3rd wrong | The **answer** and a short explanation (🧩). The question goes to the **Fix-it** queue. |

- A **Hint** button gives the hints at any time ("Hints are free. Use them!"), but a hinted answer no longer counts as right first time.
- After a right first-time answer, **Why?** shows the explanation.
- Wrong answers never cost coins, points or lives.
- **Leaving a round early:** the answers already given still count towards mastery, but the round gives no stars, coins or daily-goal credit.

**Brain power (points) per right answer:**

- right first time: 100 × skill level × (1 + 0.2 × combo)
- right after help: 40 × skill level
- with the optional speed bonus on, a first-time answer in under 15 seconds earns 1.5×

A **combo** counts right answers in a row with no wrong try. Sound, music and effects get more exciting as the combo grows.

## 5. Mastery, stars and difficulty

- **Mastered** = at least 8 of the last 10 answers right first time, on at least 2 different days. A mastered skill shows 3 stars and stays mastered.
- **Stars before mastery** come from a practice round's first-try score: 60% or more gives 1 star, 80% or more gives 2.
- **Difficulty adapts per skill.** Each skill has 3 levels. 3 right first time in a row moves up a level; 2 misses in a row moves down.
- **Grade progress** = mastered skills ÷ skills in the grade.

## 6. Fix-it

- Every question missed 3 times is saved for later, up to **30 per grade** (oldest dropped).
- **Fix-it** plays up to 10 of them. Each one answered right first time leaves the queue and earns **+3 coins**.
- Saved mistakes also come back inside practice rounds as a "second chance".

## 7. Boss battles

- Each unit ends with a **boss**. It unlocks when **every skill in the unit has at least 1 star**.
- A boss battle is **12 mixed questions** from the whole unit, one level harder than the child's current level for each skill (at most level 3).
- The boss has 8 health. Right first time knocks off 1; right after help knocks off 0.5. Health at 0 wins.
- The first win on a unit gives **+25 coins**.

## 8. The 60-second challenge

- Opens on a skill once it has **2 stars**.
- As many questions as possible in 60 seconds, at level 2 or above. Points grow with each right answer.
- Coins: 1 for every 2 right answers. The best score is kept. It doesn't count towards mastery, but it does count as a real round for the daily goal.

## 9. Wishes

- A grown-up sets **4 wishes per player per grade** in the Parents area: small wishes at **25%, 50% and 75%** of the grade mastered, and a big wish at **100%**.
- A wish unlocks only once it has text and the child reaches the percentage. The child sees a celebration and is told to show a grown-up.
- The grown-up marks it **granted** (with undo).
- **Streak wishes:** 3 more wishes per player that unlock after **7, 14 and 30 days** in a row of meeting the daily goal, counted from the day the grown-up saves the wish.

## 10. Daily goal, streaks, freezes and milestones

- **Real round:** a round that ends normally with **5 or more questions answered**, or a 60-second challenge. Try it and leaving early don't count.
- **Daily goal:** 1, 2 or 3 real rounds a day. A grown-up picks it, and it applies to the whole family. Meeting it marks the day **done**.
- **Streak:** days in a row with the goal met. It is shown on the Play tab with a Monday–Sunday calendar (🔥 done, 🧊 frozen).
- **Freezes (🧊):** a new player starts with 1; at most **2** are held. One is earned on every 7th day of a streak, one can be bought for **30 coins**, or one can be won from the chest. When the child next meets the goal after missing days, freezes cover the missed days if there are enough. Otherwise the streak starts again at 1.
- **Milestones:**

| Streak | Coins | Special hat |
|---|---|---|
| 3 days | 10 | |
| 7 days | 25 | 🔥 |
| 14 days | 50 | |
| 30 days | 100 | 🌈 |
| 50 days | 150 | |
| 100 days | 300 | 💎 |

## 11. Rewards

**Treasure chest.** Opens once a day, after the day is done. Rough odds: 5% a rare chest-only avatar or hat, 10% a streak freeze (if fewer than 2 held), 15% a lucky sticker, otherwise 10–30 coins. When a prize is no longer possible (all collected, or freezes full), the next one down is given.

**Pet.** The child picks one of 3 eggs (Feathers, Scales, Fins) and names it. It grows with total days done: hatches after 1 day, then grows at 5, 12 and 25 days. It never shrinks. If yesterday was missed and today isn't done yet, it looks sleepy (💤), never sad.

**Sticker album.** One sticker for each mastered skill, one page per unit. A full unit page gives **+30 coins**. A separate **lucky page** of 24 stickers comes only from the chest; filling it gives **+100 coins**.

**Levels.** From total brain power: level L needs 750 × L × (L − 1) (level 2 at 1,500, level 5 at 15,000, level 10 at 67,500). Each new level gives 5 × L coins. Ranks go from Rookie to Legend.

**Coins** are earned only by playing:

| Source | Coins |
|---|---|
| Each answer right with no wrong try | 1 |
| A fixed mistake | 3 |
| A perfect practice round (all first time, at least 8 questions) | 5 |
| Daily quests (3 a day, chosen from 8) | 10–20 each |
| First win against a unit's boss | 25 |
| Full album page / full lucky page | 30 / 100 |
| Streak milestones, chest, level-ups, invites | see above and below |

**Shop (Me tab).** 8 free avatars; 11 more for 40–120 coins; 9 hats for 20–100 coins; a streak freeze for 30. Streak hats and chest items can't be bought.

**Trophies.** 33 trophies for things like first answer, combos, questions answered, bosses, streaks, levels, the pet, the album, the family goal and inviting friends.

## 12. Family team goal

- A grown-up sets a weekly reward (for example "Movie night") and a target: **5, 10, 15, 20, 25, 30 or 40 rounds** (15 by default), for all children together.
- Every real round from any child in the family fills one bar, **Monday to Sunday**.
- When the bar is full, each child sees the celebration once that week. The grown-up marks the reward as given.

## 13. Family accounts and device linking

Family accounts are optional. Without one, progress stays on each device, and backup codes can move it.

- **Parents** sign in with email and password or with Google. The first sign-in creates the family.
- **A child's device** joins with an **8-character link code** (shown as ABCD-EFGH) that a parent makes. It lasts **30 minutes**, timed by the server. The child never sees a parent's password.
- **A second parent** joins with an invite code that lasts **24 hours**.
- Each player is saved separately, so two children playing at once on two devices don't overwrite each other. When two copies of one player differ, the newest wins.
- Shared family settings: PIN, money symbol, speed bonus, daily goal, team goal and player order. Which player is active stays per device.
- When a device joins and has a child with the **same name and grade** as one in the family, it asks "Is this the same …?" and can combine them.
- Parents can see linked devices and unlink them, and remove another parent.
- Play continues offline and uploads later.

## 14. Leaderboard and nickname privacy

- The **Top** tab ranks children by: **Points**, **Minutes** (active play only), **Mastered** skills, **Streak**, **Questions** and **First-try %** (only for children with at least 50 questions). Views: **This week** (starts every Monday) or **All time**, and all grades or one grade.
- The top 50 are shown. A child always sees their own row.
- **How a child appears** (chosen by a grown-up under Parents → Players):
  - **Nickname** (default): made from the player's random id, like "Swift Otter 42". The child can roll a new one with 🎲.
  - **First name**: the name typed for the player.
  - **Hidden**: not on the board at all.
- Each entry shows the name or nickname, avatar, hat, grade and numbers. Nothing else. There is no way to message another child.
- Deleting a player hides them from the board.
- **Active minutes** count at most 90 seconds for each answered question, so a game left open doesn't add minutes.
- **The crowd:** made-up players fill the board so it never feels empty. 2–4 join each day; each plays on some days and drifts away after a while. Their numbers are scaled to the real players in each view: most sit below every real player, about 1 in 10 is worth overtaking, and none ever leads a view. A view with no real player shows none. They look like any other row, are the same on every device on the same day, and are made on the device (never stored or sent). `PMLM_FEATURES.crowd` switches them off.

## 15. Daily reminders

- **Off unless a grown-up turns them on**, per device, under Parents → Daily reminder. They choose a time from 08:00 to 20:00. On iPhone and iPad this needs the game on the Home Screen (iOS 16.4 or newer).
- A reminder is sent only when **nobody on that device has met today's goal**. At most one a day.
- Back-off: daily for the first 3 missed days, then every 3rd day, and it **stops after 14 days** without play.
- Message types: protect a streak at risk, a wish that is close (15% or less to go), a "welcome back" after 3+ days, a growth-mindset line, or a playful line.
- "Show a sample" previews one. "Turn off" removes the subscription.

## 16. Invite a friend

- On the **Me** tab a child taps 💌 **Share link**. The link carries a random 6-character code.
- Only a device with **no players yet** can use the link. Each new device counts for one invite only.
- The friend makes a player and finishes a first real round. Then the friend gets **50 coins** and the inviting child **100 coins**, for up to **10 friends** per child.
- The inviting child sees each friend's **player name** and how far they got (opened, made a player, played). The friend is told this before they start.
- Grown-ups can switch invites off on a device under Parents → Settings. Parents see a summary in the family card.

## 17. Feedback and the 🚩 button

- 🚩 on every question (except during the 60-second challenge). The child picks a reason: answer looks wrong, too hard, don't understand, picture broken, something else. The report includes the question, the expected answer and what the child typed.
- In the Parents area, **Tell us what you think** sends a free-text message (up to 1,000 characters) with an optional name.

## 18. Parent area and PIN

- On a child's device the **Parents** area sits behind a **4-digit PIN**. A parent signed in to a family account skips the PIN on their own device.
- "Forgot the PIN?" asks a grown-up multiplication question (two 2-digit numbers), then lets them set a new PIN.
- The PIN keeps children out of wishes and settings. It is a simple lock, not strong security.
- The Parents area has:
  - **Family:** each child's grade, % mastered, last played and the skill they most need help with.
  - **This week / last week report:** per child, Monday–Sunday dots, rounds, minutes, new stars, skills mastered, streak.
  - **Family team goal**, **wishes** and **streak wishes** for the chosen child and grade.
  - **Progress:** mastered skills, minutes, questions, mistakes to fix, the 3 weakest skills, a full skill table and recent mistakes. A note appears if questions failed to load on that child's device.
  - **Players:** change grade, leaderboard name, delete, add, and combine "same child twice".
  - **Home Screen** install help and **Daily reminder**.
  - **Settings:** share anonymous stats, allow invite links, sound effects, background music and its volume, speed bonus, daily goal (1–3), button sound, money symbol (₼ $ £ € ₽ ₺ ₹).
  - **Feedback**, **About this test**, **Family account**, **Backup**, **Change PIN**, and **Reset** a child's progress for one grade.

## 19. Themes, sound and read-aloud

- Four worlds: **Space** (mascot Blip 🤖), **Ocean** (Coral 🐙), **Jungle** (Mango 🐵) and **Candy** (Gummy 🧸). Each changes colours, background, map and bosses. Each child picks their own.
- Sound effects and background music can be switched off, and the music volume changed. Button sounds: clicky, thocky or off.
- **Background music** plays everywhere: each world has its own song, and each child can pick Lofi cozy, Calm focus, Adventure or Party in the Me tab (played with that world's instruments).
- **Read-aloud** (🔊) on every lesson card and question uses the device's built-in voice in British English, slowed a little. It shows only when the browser supports speech.

## 20. Offline, saving and backups

- The game is one web page. Once it is open, it plays with no internet.
- Progress saves on the device after every change. Online extras (stats, feedback, leaderboard, invites) wait in a queue and send later.
- **Backup:** copy a backup code or save a backup file, then paste or load it on another device. "Add these players" merges them, keeping the best result for each skill.
- On iPhone and iPad, putting the game on the Home Screen protects saved progress from Safari clearing website data.
- See [privacy-and-safety.md](privacy-and-safety.md) for what is stored where.
