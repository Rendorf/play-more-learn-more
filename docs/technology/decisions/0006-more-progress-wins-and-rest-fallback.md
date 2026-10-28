# 0006. More progress wins, and saving falls back to REST when the live connection is stuck

**Who this is for:** engineers changing `Sync`, `save()` or any saved player field.
**Last checked against:** this change (the PR that adds it).

**Status:** Accepted. Supersedes the "newest `updatedAt` wins" rule of [0003](0003-per-player-docs-last-write-wins.md); the rest of 0003 (one document per player, the shared document) still holds.

## Context

- A linked device could stop saving to the family for days without anyone noticing.
  - Its leaderboard entries (sent over REST by `Online`) kept updating, while the family copy stayed behind.
  - `flush()` awaited a Firestore write that never resolved: the SDK queues writes until the server answers. Its `writing` flag stayed set, so every later save was skipped silently.
- Newest-`updatedAt`-wins meant any copy saved later replaced the other whole, even with less progress in it:
  - a stale copy re-saved by another device;
  - a device whose clock is behind.
  Either could overwrite real progress.
- A null sign-in at load used to switch family saving off for good, also silently.

## Decision

- **Pick by progress first.** When two copies of a player meet, the one with more progress wins (`stats.answered`, then `stats.rounds`). Only a tie goes to the newer `updatedAt` (`PMLM_MERGE.compare`, `src/merge.js`).
- **Keep grown-up edits.** A grown-up's newer edits in the losing copy (grade and streak wishes, leaderboard choice, grade) are carried into the winner (`PMLM_MERGE.edits`). Coins are never merged, so a purchase can't be undone.
- **Upload the winner.** When this device's copy wins, it uploads it, with `updatedAt` bumped past the server's so older versions (newest-wins) take it too. The server converges on the copy with the most progress.
- **Timeouts and REST mode.**
  - Every Sync read and write has a timeout (15 s).
  - Two stuck answers in a row (`timeout`, `unavailable` or `deadline-exceeded`) switch the page to **REST mode**:
    - writes go over the same documents with plain HTTPS, using the family sign-in's ID token (the same rules apply);
    - other devices' changes are polled every 20 s.
- **Make failures visible:**
  - the top bar shows ⚠️ when changes have been unsaved for 3 minutes;
  - the Family account card shows "Last saved online" and a **Save now** button;
  - a pop-up offers a bug report with the saving diagnostics (`Sync.health()`).
- **No silent unlink.** A null sign-in on a linked device keeps the link flag and asks for re-linking. Only an explicit sign-out or unlink clears it.

## Consequences

- **Progress safety:** a child's progress can't be overwritten by a copy with less progress, whatever the clocks say.
- **Same child on two devices at once:** the device whose copy has more answers wins. The other device's last round can still be lost (as before, rare).
- **Grown-up edit on a stale copy:** if a grown-up edits a stale copy while the child has more progress elsewhere, wish and leaderboard edits are kept, but other edits on that copy are not.
- **REST mode duplicates part of the SDK's job** (encoding, polling). It is used only when the live connection fails, and `tests/e2e/family.spec.mjs` covers it against the emulators by blocking the SDK's channel.
