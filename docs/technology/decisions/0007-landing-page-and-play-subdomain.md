# 0007. A landing page at pmlm.uk, and the game at play.pmlm.uk

**Who this is for:** engineers changing hosting, `worker/`, `tools/deploy/`, `_headers`, `src/move.js` or `src/landing.*`, and the owner before any further change of address.
**Last checked against:** BUILD 2026-10-28 10:20 UTC.

**Status:** Accepted
**Date:** 2026-10-28

## Context

- In October 2026 the game moved from the GitHub address (rendorf.github.io/play-more-learn-more) to pmlm.uk on Cloudflare, and each device carried its progress along (`src/move.js`).
- The owner wanted pmlm.uk itself to be a landing page: a public "how it works" for children and for grown-ups, with real screenshots and answers to common questions. The game would live on its own subdomain.
- Browsers keep saved progress per address (origin). A new address for the game means every device that played on pmlm.uk must move its progress again. Sign-ins belong to an address too, and Home Screen apps on iPhone and iPad keep their own storage, apart from Safari.
- pmlm.uk is a Cloudflare **Worker with static files** (not a Pages project), made by a one-off upload in the dashboard: it didn't follow `main`, so every release there was a manual step. Its static files are the same on every domain it has, so static files alone can't show a different page at `/` per host.

## Decision

- **Two names, one Cloudflare Worker.** https://play.pmlm.uk/ is the game and https://pmlm.uk/ (and www) is the landing page (`src/landing.html` + `src/landing.js`, built into `welcome.html`).
- **The Worker's code runs on `/` only** (`worker/index.js`, `assets.run_worker_first: ["/"]` in `tools/deploy/wrangler.json`) and serves `welcome.html` for pmlm.uk and www.pmlm.uk, and the game for every other host, for `?stay=1` (the landing page's "Keep playing here"), and whenever anything fails. Every other path stays a plain static file, with `_headers` applied.
- **pmlm.uk moves devices on, like the GitHub address.** Before drawing anything, the landing page (`Landing.decide()`) sends a device that played on pmlm.uk to play.pmlm.uk with its progress in the `#move=` fragment, once `move.json` there answers. `_headers` now lets any address read `move.json`. An iPhone/iPad Home Screen app gets a **Copy progress code** screen instead. The copy on pmlm.uk is kept as a safety net, and pmlm.uk's reminder subscription is turned off.
- **Releases are automated.** `.github/workflows/deploy.yml` runs `wrangler deploy` (pinned) after the Tests workflow passes on `main` and checks the live site (`tools/deploy/check-live.sh`). For pull requests labelled `preview` it uploads a version without deploying it (`wrangler versions upload`). `wrangler.json` has no routes, so the custom domains stay as set in the dashboard.
- **Reminders carry no address.** The sender leaves the link out, and `sw.js` opens its own scope, so an old pmlm.uk subscription opens the landing page, which forwards.

Considered and not chosen:

- **The game at a path on the same origin (for example pmlm.uk/play).** Progress would not need to move, because the origin stays the same. The owner chose a clean subdomain instead.
- **Two Workers or projects, one per name.** No code needed, but more steps for the owner, two deploys to keep in step, and a gap while Cloudflare issues the certificate for the moved name.
- **Running the Worker for every request.** Every file would then depend on its code; `run_worker_first` limits it to `/`.
- **Moving to Cloudflare Pages.** The first version of this change assumed pmlm.uk was a Pages project. It wasn't, and moving would have meant a new project and moving both domains, so the deploy uses the existing Worker.

## Consequences

- **One more progress move.** Every device that played on pmlm.uk moves once more. Sign-ins don't travel: parents log in again, children's devices are linked again with a new code, **🔒 Plays as** is set again, and reminders are turned on again. iPhone and iPad Home Screen apps move by code in four steps, and the old icon is deleted only after the new one shows the players.
- **Two old addresses to keep running.** GitHub Pages and pmlm.uk both send devices on. pmlm.uk must keep serving `sw.js` for devices that subscribed there (`check-live.sh` checks it).
- **Code only on `/`.** Files such as `move.json`, `sw.js` and `stats.html` are served the same on every host. A mistyped path gets `404.html`, not the game. A broken Worker falls back to the game rather than an error page.
- **Deploys need settings outside the repository:** the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, the variable `CF_WORKER_NAME` (the token needs Workers Scripts → Edit), play.pmlm.uk as a custom domain on the Worker, and play.pmlm.uk in Firebase's authorized domains.
- **A workers.dev preview runs with the live settings,** and workers.dev isn't localhost, so its game is opened only with `#debug`. `wrangler.json` keeps workers.dev and preview addresses on.
- **The landing page must stay true to the game.** Its pictures are real screenshots (`cd tests && npm run shots`), and `build.py --check` fails if one is missing or over 200 KB. When a screen it shows changes, the pictures and words are updated in the same pull request.
