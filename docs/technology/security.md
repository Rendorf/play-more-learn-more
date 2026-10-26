# Security

**Who this is for:** the owner and engineers who change `firestore.rules`, online features or anything that handles keys.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

The game has no server of its own. All protection of online data comes from Firebase Authentication plus the Firestore security rules in [`firestore.rules`](../../firestore.rules). The rules are **not deployed automatically**: after any change, the owner pastes the file into Firebase console → Firestore → Rules → Publish, on the live project and on the staging project.

## Accounts

| Account | Made by | Used for |
|---|---|---|
| Parent (email/password or Google) | the parent | family data |
| Child's device (anonymous, Firebase SDK) | `Sync.link()` | family data, after joining with a code |
| Extras account (anonymous, REST) | `Online` on every online device | stats, feedback, leaderboard, push, invites. Never family data |
| Admin (Google, on `stats.html`) | the owner, listed in `admins/{uid}` | reading stats and feedback |
| Service account (admin SDK) | Firebase console | the reminder sender and backups. Bypasses the rules |

## Rules model

### Family data

- `isParent(fid)` and `isDevice(fid)` check that a membership document exists under `families/{fid}`. Only members read or write the family document and its players.
- A family can only be created by a non-anonymous account, with the family id equal to its own uid.
- A device or second parent joins only by writing their membership with a code whose `fid` and `role` match and whose `expires` is later than the server's time.
- Codes can be read one at a time by id, never listed. Only that family's parents create or delete them, with expiry under 2 days.
- `users/{uid}` is a pointer each account writes for itself. It grants nothing.
- Deleting a device's membership cuts it off at once: its next read or write is refused, and the game treats that as "unlinked".

### Family-test extras

- `events` and `feedback`: create only, with an exact list of allowed keys, allowed `type` / `kind` values and size limits. Only admins read them.
- `leaderboard/{pid}_{uid}`: any signed-in account reads; only the owning account writes its own documents, with checked keys and ranges.
- `push/{uid}`: only that account (and admins) read; only that account writes, with an `https://` endpoint and a short `kids` list.
- `invites`, `friends`, `referred`: only the owner of an invite reads it and its friends. A device is counted for one invite only, never its own. The owner can set `rewarded` once, only after `played`, so coins are paid once whichever device asks.
- `admins/{uid}`: written only in the console. An account can only check its own entry.
- A rules test checks that the extras can't reach family data.

## Public by design

These are in the public repository on purpose. They identify the project, they do not grant access.

- The Firebase web config (`PMLM_FIREBASE` in `src/config.js`), including its `apiKey`.
- The Web Push public key (`PMLM_VAPID`).
- Project ids and site URLs.

## Secrets

Never commit these. Values never appear in docs, issues or chat.

| Secret | Where it lives |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | GitHub Actions secret (live project service-account JSON) |
| `VAPID_PRIVATE_KEY` | GitHub Actions secret, written by `tools/admin/setup-push.mjs` without printing it |
| Staging service account and staging VAPID key | the owner's computer under `~/.config/pmlm/` (or env `FIREBASE_SERVICE_ACCOUNT_STAGING`, `VAPID_PRIVATE_KEY_STAGING`) |
| Live service-account key for backups | the owner's computer under `~/.config/pmlm/` |
| Database backups | the owner's computer, outside the repository (they contain family data) |

Personal or family details belong in `CLAUDE.local.md`, which is gitignored, never in the repository.

## Privacy choices

- Stats and feedback carry a random device id and a random player id, never names. The exception is the parent's optional `name` field on general feedback.
- The leaderboard shows a generated nickname unless a grown-up picks "First name" or "Hidden".
- Reminder subscriptions hold avatars and streak numbers, no names.
- Parents can turn off stats and invites per family, and every extra can be switched off for everyone in `PMLM_FEATURES`.
- Extras are off on localhost and `file:` (unless `?emu=1`), in `#debug` and `#selftest`, and in the claude.ai artifact.

## Threat notes and known limitations

- **The parent PIN is not a security boundary.** It is stored as `btoa('pm' + digits)` in `pmlm.v1` and in the family's shared document, which linked children's devices can read. The "forgot PIN" path is a multiplication question. It keeps young children out of the parent area, nothing more.
- **Any family member can change any player.** Linked devices have full read and write access to all players and the family document (including the shared PIN). The rules don't check what is written inside `data`.
- **The leaderboard is readable by anyone who makes an anonymous account** with the public web config. Entries show a nickname, or a first name if a grown-up chose it.
- **Leaderboard spoofing:** readers keep the newest document per `pid`. Another account could write a document with someone else's `pid` and a later `t`, and it would show instead. Values are range-checked but not verified.
- **Spam:** any anonymous account can create `events` and `feedback`. Keys and sizes are limited; there is no rate limit or App Check.
- **Code expiry** is up to the client below the 2-day rule limit. Codes are 8 characters from 31 (about 8.5 × 10¹¹ combinations) and can't be listed.
- **Invite friend names:** a friend's player name (up to 16 characters) is visible to the inviting device.
- **Anonymous extras account:** its refresh token is in `pmlm.anon` in localStorage. Losing it only loses that device's leaderboard ownership and invite codes.
- **Service account and backups** bypass all rules. Keep the key files on the owner's machine only and delete downloaded copies.
- **Rules drift:** because rules are published by hand, the live project can run older rules than the repository. Publish before merging any change that needs new rules.
