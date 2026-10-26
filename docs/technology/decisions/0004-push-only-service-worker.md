# 0004. A service worker for push only, with no caching

**Who this is for:** engineers touching `sw.js`, reminders or offline behaviour.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

**Status:** Accepted

## Context

- Daily reminders need Web Push, and Web Push needs a service worker. On iPhone and iPad it also needs the game added to the Home Screen (iOS 16.4 or newer).
- A caching service worker can keep serving an old version after a release, and a broken one is hard to recover from on children's devices. (inferred)
- The game already works offline once loaded, because it is one self-contained page ([0001](0001-single-file-no-framework.md)).

## Decision

- `sw.js` only shows push messages and opens or focuses the game when one is tapped. It caches nothing and has no fetch handler.
- It activates at once (`skipWaiting`, `clients.claim`).
- The game registers it only when a grown-up turns reminders on, not on every visit.
- The hourly GitHub Actions job (`tools/admin/send-reminders.mjs`) decides who gets a message, using the same rules file as the game (`src/reminders.js`).

## Consequences

- A reload always gets the newest version from GitHub Pages; rollback by `git revert` reaches devices on their next reload.
- Opening the game with no network at all still needs the browser's own HTTP cache; there is no guaranteed offline start. (inferred)
- Children's devices still need a reload after each release.
- Changing the VAPID key pair stops every existing subscription, so `setup-push.mjs` refuses without `--force`.
- Scheduled reminders depend on GitHub Actions, which pauses scheduled jobs after 60 days without repository changes.
