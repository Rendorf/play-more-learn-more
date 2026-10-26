# 0005. The claude.ai copy saves through the artifact `db` capability, not Firebase

**Who this is for:** engineers publishing or changing the claude.ai artifact copy.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

**Status:** Accepted

## Context

- The game is also published as a claude.ai artifact (`build/artifact.html`).
- The artifact's content security policy blocks gstatic, so the Firebase SDK can't load there (`CLAUDE.md`). REST calls to Firebase would also leave the artifact. (inferred: why `Online` is off too.)
- Artifact viewers still want progress that survives across devices and browsers.

## Decision

- The engine detects the artifact with `window.claude.use`. There, `Sync` and `Online` switch themselves off and the family-account card is hidden.
- `Cloud` in `src/engine.js` saves the whole state through the artifact `db` capability, one document per viewer at `data/users/{viewerId}/pmlm` (`state` as JSON, `updatedAt`). Writes wait 2 seconds and only the latest is sent.
- On load, the stored copy replaces the device copy only if its `updatedAt` is newer and its `v` is `1`.
- Backups use the artifact `downloads` capability when it is offered.

## Consequences

- One source and one build serve all three targets; the artifact needs no separate code path beyond `Cloud`.
- The artifact has no family accounts, leaderboard, stats, feedback, reminders or invites.
- Whole-state, last-write-wins per viewer: two tabs of the same viewer can overwrite each other. (inferred: accepted, one child per viewer is the common case.)
- If the capability is missing or revoked, the game falls back to localStorage only.
- Publishing is manual: build, then publish `build/artifact.html` to the existing artifact URL with the Artifact tool.
