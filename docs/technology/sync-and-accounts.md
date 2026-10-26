# Family accounts and sync

**Who this is for:** engineers working on `Sync` in `src/engine.js`, and the owner when a family reports lost or doubled progress.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

Family accounts are optional. Without them, progress stays in each browser and backup codes move it between devices. With them, every player is kept in Firestore and every linked device sees the same progress.

`Sync` uses the Firebase compat SDK (app, auth, firestore), loaded from gstatic only when needed. It is separate from `Online` (the family-test extras), which has its own anonymous account. See [data-model.md](data-model.md) for the document shapes.

## Roles

- **Parent:** signs in with email and password or Google. The first sign-in creates `families/{uid}`, so the family id is the first parent's uid.
- **Second parent:** signs in, then types a parent invite code (valid 24 hours).
- **Child's device:** signs in anonymously and joins with a device link code (valid 30 minutes). Children never see a parent password.

`users/{uid}` points each account at its family (`fid`, `role`). It is only a pointer: access comes from `families/{fid}/parents/{uid}` or `families/{fid}/devices/{uid}`.

## Parent sign-in

```mermaid
sequenceDiagram
  participant P as Parent's browser
  participant A as Firebase Auth
  participant F as Firestore
  P->>A: sign in (email/password or Google popup)
  A-->>P: user (uid)
  P->>F: get users/{uid}
  alt pointer exists
    P->>F: get families/{fid}/parents/{uid}
    Note over P: missing → treated as unlinked
  else first sign-in
    P->>F: batch: families/{uid} {createdBy, shared, updatedAt}<br>+ parents/{uid} + users/{uid}
  end
  P->>F: startSync: read family doc and all players
  P->>F: listen to players, family doc, devices, parents
```

## Linking a child's device

Codes are 8 characters from an alphabet without look-alikes (no I, L, O, 0, 1), shown as `ABCD-EFGH`.

```mermaid
sequenceDiagram
  participant P as Parent
  participant F as Firestore
  participant C as Child's device
  participant A as Firebase Auth
  P->>F: write users/{uid}.clock = serverTimestamp, read it back
  Note over P: server time, so a wrong device clock doesn't matter
  P->>F: create codes/{code} {fid, role:'device', expires: server now + 30 min}
  P-->>C: parent reads the code to the child
  C->>A: signInAnonymously
  C->>F: get codes/{code} (check it exists and the role)
  C->>F: batch: families/{fid}/devices/{uid} {name, code, linkedAt, lastSeen}<br>+ users/{uid} {fid, role:'device'}
  Note over F: rules check code.fid, code.role and expires > request.time
  C->>F: startSync, then update devices/{uid} {lastSeen, version, ua}
  F-->>P: devices listener: "Linked!"
```

- Expiry is set from the server's clock and checked by the rules against `request.time`. The rules accept any expiry under 2 days; the 30-minute and 24-hour limits come from the client.
- A parent invite works the same way with `role: 'parent'` and 24 hours. A refused invite signs the parent out again, so a reload can't create a stray family.
- A parent can cancel a code (delete it), unlink a device or remove another parent. A device can unlink itself.

## Per-player documents, newest wins

Each player is `families/{fid}/players/{pid}` with `data` (the player as JSON) and `updatedAt`. Two children playing at once on different devices write different documents, so they never overwrite each other.

```mermaid
sequenceDiagram
  participant E as engine save()
  participant S as Sync
  participant F as Firestore
  participant O as Other device
  E->>S: track()
  Note over S: compare each player (without updatedAt)<br>with the last known JSON
  S->>S: changed → p.updatedAt = now, mark dirty
  S->>S: shared settings changed → state.sharedAt = now
  S->>F: after 1.5 s: set players/{pid} {data, updatedAt}
  S->>F: set families/{fid} {shared, updatedAt} (merge),<br>delete players in the deleted map
  F-->>O: snapshot
  O->>O: applyProfile: keep remote only if its updatedAt is newer
```

- `Sync.track()` runs at the start of every `save()`. It only stamps players whose content really changed. This is why reading a player must never write defaults into it (see lazy defaults in [data-model.md](data-model.md)).
- If an update for the active player arrives during a round, it waits. When the round ends, `Sync.settle()` stamps the round first, so this device's round wins.
- Remote snapshots with pending local writes are ignored.

## The shared family document

`families/{fid}.shared` is a JSON string with the parent PIN, money symbol, timer setting, daily goal, team goal, player order and a `deleted` map. It has its own `updatedAt`, compared with `state.sharedAt`.

- Newer shared settings replace this device's.
- When a device joins, the family's PIN and settings win, even if older.
- `deleted` is merged from both sides, and listed players are removed everywhere. Which player is active stays per device.
- If the shared settings were written by a version too old to know `goal` or `team`, this device writes its own back on the next save.

## Joining with a child already on the device

If a player on the joining device has the same name (ignoring case) and grade as a family player, the device holds that player back and asks: **"Is this the same …?"**

```mermaid
sequenceDiagram
  participant C as Joining device
  participant F as Firestore
  C->>F: read all family players
  C->>C: find local players with same name + grade
  C->>C: hold them back from upload, show the question
  alt Yes, combine them
    C->>C: combineProfiles(family copy, local copy)
    C->>C: keep the device's avatar, hat and world
    C->>C: aliases[localId] = familyId, drop local player
  else No, keep both
    C->>F: upload the local player as a new player
  end
```

## Combining players and aliases

`combineProfiles(a, b, sum)` merges `b` into `a`:

- Coins, points and counters are added (when combining two players) or the larger is kept (when importing a backup code of the same player).
- For each skill the better record wins (mastered, then stars, then tries). Fix-it queues are merged without duplicates.
- Trophies keep the earliest date. Streak, pet, chest, stickers, pages, daily log, week totals, streak wishes, invite friends and rewards are merged.

Parents can also combine two players by hand (Parents → Players → "Same child twice?").

`state.aliases` maps each removed id to the kept id. A backup code made later on another device still carries the old id, so the import updates the kept player instead of bringing the old one back.

## Offline

- Play never waits for the network. Changes are saved on the device first and stay dirty until a write succeeds.
- The status line shows "Offline. Changes will upload when the internet is back." Failed writes retry after 15 seconds and when the browser goes back online.
- The Firestore SDK also queues writes while offline.
- A `permission-denied` answer means the device was unlinked. It stops syncing, clears its pointer and keeps its players locally.

## Testing these flows

Never test against the live family data. Use the mock backend (`python3 tools/make-synctest.py`, then open `build/synctest.html`) or the emulators. See [testing.md](testing.md).
