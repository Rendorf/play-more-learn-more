# Privacy and safety

**Who this is for:** parents, schools and partners who want to know what happens to children's data, the owner, and team members who change anything that stores or sends data.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

> **Status: this page describes how the game works today and what we intend. It is not a legal privacy notice and does not claim compliance with any law.** See [Legal posture](#7-legal-posture-intent-not-a-claim).

## 1. Our principles

- **Collect as little as we can.** Play works fully with nothing sent anywhere.
- **No names in statistics.** Stats use random ids.
- **Grown-ups decide.** Every online feature that touches a child can be switched off or set by a grown-up.
- **No ads, no tracking for advertising, no selling data.**
- **No contact between children.** No chat, no messages, no friend requests.
- **Kind by design.** No punishment for mistakes, no pressure tactics, reminders that back off and stop.

## 2. What is stored on the device

Everything the game needs is kept in the browser's own storage on the device (`localStorage`). It never leaves the device unless one of the online features below is used.

| What | Contents |
|---|---|
| Progress (`pmlm.v1`) | Every player on the device: first name, avatar, grade, world, progress per skill, mistakes to fix, coins, items, streak, pet, wishes text, settings, and the parent PIN (stored lightly scrambled, not strongly protected) |
| Online helpers | A random device id; the sign-in token for the device's anonymous account; a queue of stats waiting to send; the campaign tag (`?src=`); reminder on/off and hour; invite codes made on this device; whether the device came through an invite |
| Family account sign-in | When a family account is used, the Firebase sign-in data in the browser |

**Backup codes and files** contain the whole progress record, including names and the PIN. They are made only when a grown-up asks, and they go where the grown-up puts them.

Clearing the browser's data for the site deletes all of this from the device.

## 3. What is stored online, and who can see it

The online parts use one **Firebase** project (a Google cloud service). The game itself is hosted on **GitHub Pages**. Fonts load from **Google Fonts**, and the family-account code loads from Google's servers, so those services see the device's internet address when the game opens.

### Family accounts (optional)

Only the family's parents and linked devices can read or write this. Database rules enforce this on the server.

| Data | Contents |
|---|---|
| Parent sign-in | The parent's email address or Google account, held by Firebase sign-in |
| Family | Shared settings: PIN (scrambled), money symbol, speed bonus, daily goal, team goal and reward text, player order, list of removed players |
| Parents | Each parent's email and when they joined |
| Devices | The device name a grown-up typed (for example "Tablet"), when it linked and was last seen, the game version and the browser description (user agent) |
| Players | The whole player record, as on the device |
| Link codes | A short code, which family it is for, and when it expires (30 minutes for devices, 24 hours for a second parent). Codes can be read only one at a time by exact code, never listed. |

### Family-test extras

Each device signs in to these with its **own anonymous account**, separate from family accounts. None of them can read or change family data. Each can be switched off for everyone by the owner.

| Collection | What is sent | Who can read it |
|---|---|---|
| `events` (play stats) | Random device id, random player id, grade, skill ids, round counts, active seconds, version, date, phone type (`ios`, `android`, `other`), campaign tag. **No names.** Full list in [metrics.md](metrics.md). | The owner only (admin accounts) |
| `feedback` | 🚩 reports: the question text, expected answer, what the child typed, reason, skill and level. Parents' messages: free text and an **optional name** they type. | The owner only |
| `leaderboard` | Random player id, the nickname **or** first name, avatar, hat, grade, points, minutes, skills mastered, streak, questions, first-try %, this week's totals, and the device's anonymous account id | **Anyone using the game** (every device signs in anonymously) |
| `push` (reminders) | The browser's push address and keys, time zone, chosen hour, and for each child on the device: avatar, streak, freezes, last day the goal was met, and how far the next wish is. **No names.** | That device and the owner's reminder sender |
| `invites`, `referred` | The invite code, the inviting device's anonymous id and player id; for each friend: the friend's **player name** (up to 16 characters) and when they opened, joined and played | Only the inviting device and the friend's own device |
| `admins` | Owner accounts allowed to read stats | Set by hand in the console |

**Push messages** travel through the browser maker's push service (for example Apple or Google), as for any website notification.

## 4. Names and the leaderboard

A child's name is never in the stats. It can appear in only three places outside the family:

1. **The leaderboard, if a grown-up chooses "First name".** The default is a **generated nickname** (an adjective, an animal and a number, like "Swift Otter 42"), made from the random player id. The child can roll a new one. A grown-up can also choose **Hidden**, which removes the child from the board.
2. **Invite a friend.** A friend who joins through a child's link appears to that child by their player name. The friend is told this before they make a player. Grown-ups can switch invites off on a device.
3. **A parent's feedback message,** if the parent types a name or mentions one.

Children can't send anything to each other. The leaderboard has no profiles, photos or free text beyond the name or nickname.

## 5. Grown-up controls

| Control | Where | Default |
|---|---|---|
| Share anonymous play stats | Parents → Settings (per device) | On |
| Children can share invite links | Parents → Settings (per device) | On |
| How each child shows on the leaderboard | Parents → Players | Nickname |
| Daily reminder | Parents → Daily reminder (per device) | **Off** |
| Parent PIN | Parents → PIN | Asked for on first visit to Parents |
| Unlink a device, remove a parent | Parents → Devices and parents | |
| Delete a player | Parents → Players | |

**Reminders are opt-in.** A grown-up must turn them on and the browser asks for permission. They say nothing about how well a child is doing beyond a streak or wish count. At most one a day, backing off after 3 missed days and stopping after 14.

## 6. Deleting data

What works today:

- **On the device:** delete a player in Parents → Players, or clear the browser's site data.
- **Family account:** deleting a player also removes them from the family database. Unlinking a device stops it saving. Parents can remove another parent.
- **Leaderboard:** deleting a player or choosing **Hidden** replaces their entry with a hidden marker. The owner can also remove entries.
- **Reminders:** turning them off deletes the device's subscription. The sender also deletes subscriptions that stop working.

Gaps:

- Stats events and feedback can't be deleted from inside the game. They have no names, but they do carry the random ids. TODO(owner): publish a contact route and a process to delete a family's stats and feedback by device or player id on request.
- There is no "delete my family account" button. TODO(owner): add one, or document a manual process (delete the family, its players, devices, parents and the sign-in accounts).
- Invite records stay after the friend is paid. TODO(owner): decide how long to keep them.
- TODO(owner): decide how long events and feedback are kept, and where backups of the database are stored and for how long.

## 7. Legal posture: intent, not a claim

The game is used by children, so children's privacy laws are likely to apply. Examples: **COPPA** in the United States (under 13), and **GDPR** in the EU and UK, with special rules for children's consent (often called GDPR-K; the age of digital consent is 13 to 16 depending on the country) and the UK's Age Appropriate Design Code.

**We do not claim compliance with any of these today.** The design aims in that direction: data minimisation, no names in stats, nicknames by default, parent controls, no ads and no profiling for marketing. But the work below is not done.

- TODO(owner): get legal advice on which laws apply in the markets where the game is used.
- TODO(owner): write and publish a privacy notice for parents (and a child-friendly version).
- TODO(owner): decide on verifiable parental consent before any data leaves the device (for example, ask a grown-up before stats, the leaderboard and invites switch on).
- TODO(owner): confirm the lawful basis for anonymous stats, and whether stats should be **off** by default.
- TODO(owner): confirm the Firebase data location and sign Google's data processing terms; list all processors (Google/Firebase, GitHub, push services, Google Fonts).
- TODO(owner): decide whether "First name" on the public leaderboard should be allowed at all.
- TODO(owner): set a data retention period and a breach response plan.
- TODO(owner): a data protection impact assessment before any school use.

## 8. Safety beyond data

- **No chat, no user-made content** other than names, wishes text (seen only by the family) and feedback (seen only by the owner).
- **Nicknames are made from fixed word lists** of friendly adjectives and animals, so they can't be rude.
- **First names and pet names are typed freely** and could be rude or identifying. Only first names can reach other children (leaderboard, if chosen; invites).
- **Commerce:** none. Coins can't be bought. There are no ads or links to outside shops.
- **Health:** sessions are short; the daily goal can be 1 round. No timers unless a grown-up turns on the speed bonus.

## Related documents

- [metrics.md](metrics.md): every stats event and field
- [product-spec.md](product-spec.md): how each feature behaves
- [../technology/data-model.md](../technology/data-model.md) (planned): the database in detail
- `firestore.rules` in the repository: the server rules that enforce who can read and write what
