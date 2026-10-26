# Metrics

**Who this is for:** the owner and team members who read the stats dashboard, and investors or partners who want to know how success is judged.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

This page defines **what is measured and what the words mean**. It holds no real numbers on purpose: the repository is public. Live numbers are on the owner's private dashboard (`stats.html`, admins only).

## 1. Where the numbers come from

During the friends-and-family test, each device sends small **events** to the game's database (the `events` collection). They are anonymous: a random device id and a random player id, never names. A parent can switch them off on a device under Parents → Settings → "Share anonymous play stats". The owner can switch them off for everyone with a feature switch. They are also off in debug and self-test modes and on local test copies.

Events wait in a queue on the device (at most 200) and send when there is internet, so offline play is counted later.

Two other collections feed the dashboard: `feedback` (🚩 reports and parents' messages) and `leaderboard` (one entry per child per device). Reminder subscriptions (`push`) give the count of devices with reminders and their chosen hours. See [privacy-and-safety.md](privacy-and-safety.md).

## 2. Fields on every event

| Field | Meaning |
|---|---|
| `type` | Which event (see below) |
| `d` | Random device id, made on the device the first time (letter `d` plus 11 random characters) |
| `p` | Random player id (no name). Missing on events that are not about a player. |
| `v` | Game version (`BUILD`) |
| `day` | The device's local date, `YYYY-MM-DD` |
| `dev` | `ios`, `android` or `other` |
| `t` | Time sent from the device, in milliseconds |
| `src` | Optional campaign tag: from a link like `?src=ff1`, or `invite` for a device that came through a friend's link. Kept once per device. |

## 3. Event types

| Type | When it is sent | Extra fields |
|---|---|---|
| `open` | The first time the game opens on a device each day | `n`: number of players on the device |
| `player` | A new player is made | `g`: grade |
| `lesson` | A lesson's Try it is finished | `g`, `sk`: skill id |
| `round` | A round ends normally (practice, 60-second challenge, boss, Fix-it) | `g`; `sk`: skill or unit id; `mode`: `practice`, `extra`, `boss` or `fix`; `n`: questions answered; `ok`: right first time; `secs`: active seconds; `m`: skills newly mastered |
| `place` | A "Find my level" round ends | same as `round`, with `mode` = `place` |
| `wishset` | A grown-up saves wishes | `g`; `n`: how many wishes have text |
| `wish` | A wish unlocks | `g`; `n`: the threshold (25, 50, 75 or 100) |
| `problem` | Questions for a skill could not be made on the device | `g`, `sk`; `n`: level; `msg`: the error (up to 500 characters) |
| `invite` | A step of invite-a-friend | `mode`: `share` (child shared a link), `open` (a new device opened a link; no player id yet), `join` (that device made a player), `play` (it finished a first real round), `reward` (the inviter was paid) |

Rounds left early send nothing. Try it is counted as `lesson`, not `round`.

## 4. Key definitions

**Child.** A player id that has made a `player` event or played at least once. One child on two unlinked devices appears as two children.

**Device.** A distinct `d`. Clearing browser data makes a new one.

**Real round.** A round that ends normally with **5 or more questions answered**, or any 60-second challenge. Only real rounds count towards the daily goal, the streak and the family team goal. (Event counts of `round` include short rounds too.)

**Active seconds / active minutes.** A round's length, but never more than **90 seconds per answered question**. This stops a game left open from counting as play. Minutes on the leaderboard and the dashboard use this.

**Day done.** The child finished the family's daily goal (1, 2 or 3 real rounds) on that local date.

**Streak.** Days done in a row. Missed days covered by freezes don't break it.

**Mastered skill.** At least 8 of the last 10 answers right first time, on at least 2 different days.

**Right first time / first-try %.** Right with no wrong try and no hint. First-try % = right first time ÷ questions answered.

**Week.** ISO week: **Monday to Sunday**, by the device's local date. The weekly leaderboard, the family team goal and the parent report all use it.

**Played on a day.** For the dashboard, a child "played" on a day if they sent a `round`, `lesson` or `place` event that day.

## 5. What the dashboard shows today

- Totals: children, devices, played today, played in the last 7 days, rounds, active minutes, devices with reminders, feedback messages.
- **Came back another day:** of children first seen at least 1 day ago, the share who played on 2 or more days.
- **Still playing after 7 days:** of children first seen at least 7 days ago, the share who played 7 or more days after their first day.
- **First visit funnel:** players created → finished a lesson → played a round → 3+ rounds → came back another day → a grown-up set a wish.
- **Invite funnel** (by device): shared a link → a friend opened it → made a player → finished a first round → inviter rewarded.
- Each day for the last 3 weeks, each child (by random id), feedback and 🚩 reports, questions that failed to load, the leaderboard, and reminder hours.

## 6. Proposed success metrics for the family test

These are **proposals**, not targets. Targets need real data first. TODO(owner): set target values once there are a few weeks of data.

**North star: weekly learning children.** Children who mastered at least one new skill or did 3+ real rounds in the week. It joins engagement and learning in one number.

| Area | Metric | Why it matters |
|---|---|---|
| Activation | Share of new players who finish a first real round on day 1 | The first session works |
| Activation | Share of families where a grown-up sets a wish within 7 days | Parents are involved; wishes are our main hook |
| Retention | Came back another day (D1); still playing after 7 days (D7); still playing after 28 days (D28) | Habit forming |
| Habit | Median days done per active child per week | The daily goal is realistic |
| Learning | Skills mastered per child per active week | Real progress, not just time |
| Learning | First-try % on a skill: first 10 answers vs. last 10 answers | Children improve with practice |
| Learning | Share of Fix-it questions later answered right first time | Mistakes get fixed |
| Quality | `problem` events per 1,000 rounds; 🚩 reports per 1,000 questions | Content is correct and loads everywhere |
| Reminders | Share of reminded devices that play that day vs. devices without reminders | Reminders help, not annoy |
| Growth | Invite funnel conversion; friends who finish a first round per sharing child | Word of mouth works |
| Safety | Share of children shown by first name vs. nickname vs. hidden | Parents use the privacy choices |

**Guardrails** (should not get worse): average session length staying short (a round is about 5 minutes); no rise in reports of "too hard"; reminders turned off soon after being turned on.

## 7. What we can't measure (yet)

- Learning outside the game, such as school marks. TODO(owner): decide whether to ask parents for consent to compare with school results.
- Who a child is across devices, unless the family links them with a family account. Stats never use family-account ids.
- Anything on devices where a parent switched stats off, or in the claude.ai copy of the game.
- Parent satisfaction, except through free-text feedback. TODO(owner): decide on a short parent survey.
