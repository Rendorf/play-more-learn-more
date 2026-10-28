# Data model

**Who this is for:** the owner and engineers who change anything that is saved, on a device or online.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

Children's progress is the most valuable thing in this project. Read the compatibility rules before you change any saved shape.

## Compatibility rules

- **Never rename or drop a field** in `pmlm.v1` or in a player document. Older versions still running on children's devices read them.
- **Never change `STORE_KEY` (`pmlm.v1`) or `v` (always `1`).** `load()` ignores saved data whose `v` is not `1`.
- **Only add optional fields.** Code must work when the field is missing.
- **Lazy defaults:** reading a player never writes defaults into it. Only a real event (a played round, a grown-up's choice) creates a new field. If looking at a sibling wrote defaults, `Sync.track()` would see a change, stamp a new `updatedAt`, and that stale copy could win over the sibling's real progress. Use read-only helpers such as `masteredCount` and `peekPct` (not `gradeState` / `skillState`, which create entries) when reading another player.
- **Rollback must be safe:** an older version opening a newer save keeps the new fields untouched. `tests/e2e/progress.spec.mjs` checks this against saves from the live version in `tests/fixtures/`.

## Device storage

### `pmlm.v1` (localStorage)

The whole game state, as JSON. `save()` writes it 250 ms after a change. In the preview copy the key is `pmlm-preview.v1`.

```text
{
  v: 1,                       // never changes
  pin: string | null,         // parent PIN, stored as btoa('pm' + digits) (obfuscated, not hashed)
  settings: {
    sfx: bool, music: bool, timer: bool,
    currency: string,          // money symbol, default '₼'
    keySound: string,          // 'clicky' etc.
    dailyGoal: 1 | 2 | 3,
    musicVol?: 0-100,          // optional: background music volume on this device (default 50)
    stats?: bool,              // optional: false = no anonymous play stats from this device
    invites?: bool             // optional: false = children can't share invite links
  },
  profiles: [Player],
  current: playerId | null,   // active player, per device (never synced)
  lock?: playerId | null,     // a parent locked this device to one child (copied from devices/{uid}.player)
  updatedAt: ms,
  // optional, added later
  sharedAt?: ms,              // when the shared family settings last changed
  deleted?: { [playerId]: ms },     // removed players, so other devices remove them too
  aliases?: { [oldId]: keptId },    // combined players: later backup codes update the kept one
  team?: { target, text, emoji, given: { [weekStartDate]: ms } }  // family team goal
}
```

### Player

Fields created with every new player:

```text
{
  id: 'p…',                   // random, never changes
  name, avatar, grade (1–9), theme ('space' | 'ocean' | 'jungle' | 'candy'), hat: string | null,
  coins, brain,               // brain = points; level comes from it
  owned: [item], trophies: { [id]: ms },
  streak: { days, last: 'YYYY-MM-DD' | null, best, freezes, frozen: [date] },
  quests: { date, list: [...] },
  stats: { answered, correct, first, ms, rounds, bestCombo, fixed, perfect },
  grades: { [grade]: Grade }
}
```

Optional fields, written only when something real happens:

| Field | Written when | Shape |
|---|---|---|
| `updatedAt` | `Sync.track()` sees a change (family accounts on) | ms |
| `days` | a round ends | `{ 'YYYY-MM-DD': { r, ms, st, q } }`, pruned to 120 days |
| `pet` | first goal day, or the child names a pet | `{ kind, name, days, last }` |
| `chest` | the daily chest is opened | `{ last: date, opened }` |
| `lucky` | a lucky sticker is won | `[emoji]` |
| `pages` | a unit sticker page is completed | `{ [unitId]: ms }` |
| `teamSeen` | the family goal celebration is shown | week-start date |
| `streakWishes` | a parent saves streak wishes | `[{ at: 7/14/30, text, emoji, status, prog, unlockedAt?, grantedAt? }]` |
| `diag` | a question fails to load | last 10 of `{ t, skill, level, msg, ua, v }` |
| `stats.active` | a round ends | seconds of active play (at most 90 s per answered question) |
| `week` | a round ends | `{ id: ISO week, pts, secs, q, mst }` |
| `board` | a grown-up picks it | `'nick'` \| `'name'` \| `'hidden'` |
| `nickSeed` | the child taps 🎲 | number |
| `friends` | the inviting device checks who came | `{ [friendUid]: { n: name, s: 'o' \| 'j' \| 'p' \| 'r', t } }` |
| `inviteRewards` | the inviting device is paid for a friend | `{ [friendUid]: ms }` |
| `music` | the child picks a music style in the Me tab | `'theme'` \| `'lofi'` \| `'calm'` \| `'adventure'` \| `'party'` |

### Grade and skill

```text
Grade = {
  skills: { [skillId]: Skill },
  review: [ { skill, q, ... } ],   // Fix-it queue
  bosses: { [unitId]: ... },
  placed: bool,                     // placement done
  wishes: [ { at: 25|50|75|100, text, emoji, status: 'locked'|'unlocked'|'granted', ... } ]
}
Skill = { lesson, stars, best, hist: [..last answers], days: [..], level, run, miss,
          mastered: ms | null, last, tries, right, extra }
```

Mastery is 8 of the last 10 answers right first time, on 2 different days.

### Other device keys

All use the same prefix (`pmlm.` live, `pmlm-preview.` preview).

| Key | Store | Written by | Holds |
|---|---|---|---|
| `pmlm.v1` | localStorage | `engine.js` | game state (above) |
| `pmlm.sync` | localStorage | `Sync` | `'1'` while this device is signed in to a family, so the SDK loads at start. Also set when progress arrives from an old address that was in a family, so the status says "link it again" |
| `pmlm.dev` | localStorage | `Online` | random device id for stats (`d` + 11 characters) |
| `pmlm.anon` | localStorage | `Online` | the extras' anonymous account: `{ uid, refresh }` (refresh token) |
| `pmlm.q` | localStorage | `Online` | queue of unsent `events` / `feedback` (last 200) |
| `pmlm.src` | localStorage | `Online` | where the device came from (`?src=` or `invite`) |
| `pmlm.opened` | localStorage | `Online` | last day the "open" event was sent |
| `pmlm.push` | localStorage | `Online` | `{ on, hour }` for reminders |
| `pmlm.inv` | localStorage | `Online` | this device's invite code per player: `{ [pid]: code }` |
| `pmlm.ref` | localStorage | `Online` | the invite this device came through: `{ code, stage, sent, t, name?, joined?, played?, gift?, dead? }` |
| `pmlm.moved` | localStorage | landing page (pmlm.uk only) | `{ key, t }`: the progress (`updatedAt:players`) this device already took to play.pmlm.uk, so the same copy isn't sent again |
| `pmlm.dayShift` | sessionStorage | `#debug` only | debug clock shift in days (always the `pmlm.` prefix) |

The Firebase SDK keeps its own sign-in data in IndexedDB.

## Firestore

Project `playmorelearnmore` (live). The preview uses a separate staging project with the same rules. Rules are in [`firestore.rules`](../../firestore.rules); [security.md](security.md) explains them.

### Family accounts (`Sync`, Firebase SDK)

| Path | Fields | Read | Write |
|---|---|---|---|
| `users/{uid}` | `fid`, `role` (`'parent'` \| `'device'`), `clock` (server timestamp, used to read the server's time) | that account | that account. A pointer only; it grants nothing |
| `codes/{code}` | `fid`, `role` (`'device'` \| `'parent'`), `expires` (timestamp), `createdBy` | any signed-in account, one at a time by id (never listed) | create: a parent of `fid`, expiry under 2 days. Delete: a parent of `fid` |
| `families/{fid}` | `createdBy`, `shared` (JSON string, below), `updatedAt` | parents and devices of the family | create: a non-anonymous account whose uid is `fid`. Update: members |
| `families/{fid}/parents/{uid}` | `email`, `joinedAt`, `code?` | parents; the account itself | create: the family creator, or with a valid parent code. Delete: parents |
| `families/{fid}/devices/{uid}` | `name`, `code`, `linkedAt`, `lastSeen`, `version` (BUILD), `ua`, `player?` (the device lock) | parents; the device itself | create: with a valid device code, no `player`. Update: the device itself (code and `player` unchanged), or a parent changing only `player`. Delete: parents or the device |
| `families/{fid}/players/{pid}` | `data` (the player as a JSON string), `updatedAt` | members | members |

The `shared` string on the family document:

```text
{ pin, currency, timer, goal (dailyGoal), team, order: [playerId], deleted: { [playerId]: ms } }
```

### Family test extras (`Online`, REST, own anonymous account)

| Path | Fields | Read | Write |
|---|---|---|---|
| `events/{auto}` | `d` (device id), `p` (player id), `type` (`open`, `player`, `lesson`, `round`, `place`, `wishset`, `wish`, `problem`, `invite`), `g`, `sk`, `mode`, `n`, `ok`, `secs`, `m`, `v`, `day`, `dev`, `src`, `msg`, `t` | admins | create only, any signed-in account, fixed keys and sizes |
| `feedback/{auto}` | `d`, `p`, `kind` (`question` \| `general` \| `bug`), `reason`, `g`, `sk`, `lvl`, `mode`, `q`, `ans`, `inp`, `text`, `name`, `v`, `day`, `dev`, `src`, `t`; bug reports add `what`, `screen`, `log` (≤2000), `sync` (≤600), `err` (≤1000) | admins | create only, any signed-in account |
| `leaderboard/{pid}_{uid}` | `pid`, `owner`, `hid`, `nick`, `av`, `hat`, `g`, `pts`, `min`, `mst`, `str`, `frz`, `day`, `q`, `acc`, `wk`, `wpts`, `wmin`, `wq`, `wmst`, `v`, `t` | any signed-in account | the owning account only. Delete: owner or admin |
| `push/{uid}` | `owner`, `sub: { endpoint, p256dh, auth }`, `tz`, `off`, `hour`, `kids: [{ av, str, frz, last, wish }]`, `t`, `lastSent`, `lastMsg` | that account; admins | that account (the sender writes `lastSent`, `lastMsg` with the admin SDK) |
| `invites/{code}` | `owner`, `pid`, `t` (code is 6 of `A–Z0–9`) | the owner only | create by the owner |
| `invites/{code}/friends/{uid}` | `t`, `name` (≤16), `joined`, `played`, `rewarded` | that friend's account; the invite owner | create: the friend, only if `referred/{uid}` points at this code. Update: the friend (not `rewarded`), or the owner sets `rewarded` once after `played` |
| `referred/{uid}` | `code`, `t` | that account | create once, not for your own invite |
| `admins/{uid}` | any field (for example `ok: true`) | that account checks its own entry | only in the Firebase console |

Readers of the leaderboard keep the newest document per `pid` (by `t`), because the same child can play on several devices.

The Top tab also mixes in the crowd from `Board.crowd()` (`src/board.js`): made-up players generated on the device from the date (ids `zc<day>_<n>`, never starting with `p`). They are never stored or sent, so they never appear in this collection or on stats.html. `Board.rows()` scales their levels to the real players in each view and keeps them below the best.

### claude.ai artifact copy

No Firestore. `Cloud` in `engine.js` keeps one document per viewer through the artifact `db` capability, at `data/users/{viewerId}/pmlm`, with `state` (the whole `pmlm.v1` JSON) and `updatedAt`. On load, the newer of the device copy and the stored copy wins.
