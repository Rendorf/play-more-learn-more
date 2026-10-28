# 0003. One document per player, newest `updatedAt` wins

**Who this is for:** engineers changing `Sync`, `save()` or any saved player field.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

**Status:** Accepted; the "newest wins" comparison is superseded by [0006](0006-more-progress-wins-and-rest-fallback.md) (more progress wins).

## Context

- Siblings play at the same time on different devices. One shared document for the whole family would let one device overwrite another child's progress (comment on `Sync` in `src/engine.js`).
- Devices go offline and come back later, and families update devices to new versions at different times.
- Progress must never be lost.

## Decision

- Each player is its own document, `families/{fid}/players/{pid}`, holding the whole player as a JSON string in `data`, plus `updatedAt`.
- Family-wide settings (PIN, money symbol, timer, daily goal, team goal, player order, deletions) live as a JSON string in `shared` on `families/{fid}`, with their own `updatedAt`.
- `Sync.track()` runs in every `save()`. It compares each player with the last known copy and stamps `updatedAt` only on players that really changed.
- When two copies meet, the one with the newer `updatedAt` wins whole. There is no field-level merge.
- A remote update for the player in an active round waits until the round ends; the round is stamped first, so it wins.
- Where two copies of the same child must be merged on purpose (joining a family, combining players, importing a backup), `combineProfiles` keeps the best record per skill.

## Consequences

- Two children never overwrite each other.
- The data is stored as a JSON string, so older versions round-trip new fields they don't know without dropping them. (inferred: a reason for storing a string rather than Firestore fields.)
- The same child playing on two devices at once: the later save wins, and the other device's round in between can be lost. (inferred: accepted as rare.)
- **Lazy defaults are required.** If reading a player wrote default fields into it, `track()` would stamp it as newer and a stale copy could overwrite real progress. Only real events may create new fields.
- Device clocks decide `updatedAt`. A device with a clock far in the future could win too often. (inferred: link-code expiry uses the server clock for this reason, but player stamps do not.)
- Firestore rules can't check what is inside `data`.
