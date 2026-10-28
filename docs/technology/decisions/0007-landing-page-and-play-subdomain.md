# 0007. A landing page at pmlm.uk, and the game at play.pmlm.uk

**Who this is for:** engineers changing hosting, `functions/`, `_headers`, `src/move.js` or `src/landing.*`, and the owner before any further change of address.
**Last checked against:** BUILD 2026-10-28 10:20 UTC.

**Status:** Accepted
**Date:** 2026-10-28

## Context

- In October 2026 the game moved from the GitHub address (rendorf.github.io/play-more-learn-more) to pmlm.uk on Cloudflare Pages, and each device carried its progress along (`src/move.js`).
- The owner wanted pmlm.uk itself to be a landing page: a public "how it works" for children and for grown-ups, with real screenshots and answers to common questions. The game would live on its own subdomain.
- Browsers keep saved progress per address (origin). A new address for the game means every device that played on pmlm.uk must move its progress again. Sign-ins belong to an address too, and Home Screen apps on iPhone and iPad keep their own storage, apart from Safari.
- One Pages project serves the same static files on every domain it has, so static files alone can't show a different page at `/` per host.
- pmlm.uk was a one-off Direct Upload to Cloudflare Pages: it didn't follow `main`, so every release there was a manual step.

## Decision

- **Two names, one Cloudflare Pages project.** https://play.pmlm.uk/ is the game and https://pmlm.uk/ (and www) is the landing page (`src/landing.html` + `src/landing.js`, built into `welcome.html`).
- **A Pages Function on `/` only** (`functions/index.js`) serves `welcome.html` for pmlm.uk and www.pmlm.uk, and the game for every other host, for `?stay=1` (the landing page's "Keep playing here"), and whenever anything fails. Every other path stays a plain static file.
- **pmlm.uk moves devices on, like the GitHub address.** Before drawing anything, the landing page (`Landing.decide()`) sends a device that played on pmlm.uk to play.pmlm.uk with its progress in the `#move=` fragment, once `move.json` there answers. `_headers` now lets any address read `move.json`. An iPhone/iPad Home Screen app gets a **Copy progress code** screen instead. The copy on pmlm.uk is kept as a safety net, and pmlm.uk's reminder subscription is turned off.
- **Releases are automated.** `.github/workflows/deploy.yml` publishes the project with a pinned wrangler after the Tests workflow passes on `main`, checks the live site (`tools/deploy/check-live.sh`), and makes a pages.dev copy for pull requests labelled `preview`.
- **Reminders carry no address.** The sender leaves the link out, and `sw.js` opens its own scope, so an old pmlm.uk subscription opens the landing page, which forwards.

Considered and not chosen:

- **The game at a path on the same origin (for example pmlm.uk/play).** Progress would not need to move, because the origin stays the same. The owner chose a clean subdomain instead.
- **Two Pages projects, one per name.** No function needed, but more steps for the owner, two deploys to keep in step, and a gap while Cloudflare issues the certificate for the moved name.
- **An advanced-mode `_worker.js`.** It would route every request through the worker, not just `/`, so every file would depend on it.

## Consequences

- **One more progress move.** Every device that played on pmlm.uk moves once more. Sign-ins don't travel: parents log in again, children's devices are linked again with a new code, **🔒 Plays as** is set again, and reminders are turned on again. iPhone and iPad Home Screen apps move by code in four steps, and the old icon is deleted only after the new one shows the players.
- **Two old addresses to keep running.** GitHub Pages and pmlm.uk both send devices on. pmlm.uk must keep serving `sw.js` for devices that subscribed there (`check-live.sh` checks it).
- **Functions only on `/`.** Files such as `move.json`, `sw.js` and `stats.html` are served the same on every host. A mistyped path gets `404.html`, not the game. A broken function falls back to the game rather than an error page.
- **Deploys need settings outside the repository:** the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, the variable `CF_PAGES_PROJECT`, play.pmlm.uk as a custom domain on the project, and play.pmlm.uk in Firebase's authorized domains.
- **A pages.dev preview runs with the live settings,** and pages.dev isn't localhost, so its game is opened only with `#debug`.
- **The landing page must stay true to the game.** Its pictures are real screenshots (`cd tests && npm run shots`), and `build.py --check` fails if one is missing or over 200 KB. When a screen it shows changes, the pictures and words are updated in the same pull request.
