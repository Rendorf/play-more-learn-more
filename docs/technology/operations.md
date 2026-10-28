# Operations

**Who this is for:** the owner, and any engineer who releases a change or looks after the live game.
**Last checked against:** BUILD 2026-10-28 10:20 UTC.

The pull request template (`.github/pull_request_template.md`) has the full release checklist. This page explains each step.

## Release

`main` is protected: nobody pushes to it directly. A change goes live only through a pull request whose **test** check passes on a branch that is up to date with `main`.

1. Work on a branch. Rebuild after changing `src/`, and commit `index.html`, `stats.html`, `welcome.html` and `manifest.webmanifest` with the source (and `landing/` when its pictures changed).

```bash
python3 build.py
```

2. Run all checks.

```bash
tests/run-all.sh
```

3. Push and open a pull request.

```bash
git push -u origin my-change
```

```bash
gh pr create --fill
```

4. Turn on auto-merge. It merges when the tests are green. If `main` moved, use "Update branch" on the pull request.

```bash
gh pr merge --auto --merge
```

5. The **Tests** workflow runs again on `main`. When it passes, the **Deploy** workflow publishes play.pmlm.uk and pmlm.uk (see [Deploy workflow](#deploy-workflow)). GitHub Pages updates the old address 1–2 minutes after the merge. When the Deploy run is green, check both addresses:

```bash
curl -s https://play.pmlm.uk/ | grep "const BUILD"
```

```bash
curl -s https://pmlm.uk/ | grep pmlm-page
```

6. **Children's devices must reload** to get the new version. The service worker caches nothing, so a reload is enough. A parent's Devices list shows each linked device's version and says "reload it" when it is behind.

## Deploy workflow

https://play.pmlm.uk/ (the game) and https://pmlm.uk/ (the landing page) are one Cloudflare **Worker** with static files (its settings are `tools/deploy/wrangler.json`). The Worker (`worker/index.js`) runs for `/` only: it serves `welcome.html` for pmlm.uk and www.pmlm.uk, and the game for every other host. Every other file comes straight from the static files, with `_headers` applied. `.github/workflows/deploy.yml` ("Deploy") publishes it:

- **When:** after the **Tests** workflow passes on a push to `main`, or by hand (Actions → Deploy → Run workflow, from `main` only).
- **Steps:** `python3 build.py --check`, then `tools/deploy/stage.sh _site` copies only the served files (it refuses if one is missing, so a half-built site is never published), then `tools/deploy/smoke.sh`, then the pinned wrangler in `tools/deploy/` runs `wrangler deploy -c tools/deploy/wrangler.json`. `wrangler.json` has no routes, so the custom domains set in the dashboard stay as they are.
- **Worker check:** before wrangler runs, the workflow asks Cloudflare for the Worker by name, so a wrong token (403) or name (404, with the account's Worker names listed) fails with a clear message.
- **Live check:** `tools/deploy/check-live.sh` retries for up to 3 minutes until play.pmlm.uk serves the same `BUILD` as the commit, pmlm.uk is the landing page (`<meta name="pmlm-page" content="landing">`), `move.json` has `Access-Control-Allow-Origin: *` and `no-store`, and pmlm.uk still serves `sw.js`. A red Deploy run after a merge means the live site is not what `main` says.
- **Settings:** repository secrets `CLOUDFLARE_API_TOKEN` (a token with Account → Workers Scripts → Edit) and `CLOUDFLARE_ACCOUNT_ID`, and the repository variable `CF_WORKER_NAME` (the Worker's name; the older name `CF_PAGES_PROJECT` also works), under Settings → Secrets and variables → Actions. Without them the first step fails and names what is missing.
- **The Deploy workflow runs it before every publish, and you can run it before pushing a change to the deploy:** `bash tools/deploy/smoke.sh` stages the site into a temporary folder and serves it with `wrangler dev` and the real `wrangler.json` on port 8788 (`SMOKE_PORT`). It checks the game, `/welcome`, `move.json`'s headers, the not-found page (`404.html`), and which page each host gets.

### Cloudflare preview

Label a pull request `preview`. The Deploy workflow then uploads the pull request's version to the Worker **without deploying it** (`wrangler versions upload`), which proves the token, the Worker's name and the bundle before anything goes live. When the Worker's workers.dev address is on, the version also gets a preview address, `https://pr-<number>-<worker>.<account>.workers.dev/` (the game; `/welcome` is the landing page), shown in the run's summary. Each new push to the pull request uploads again. Pull requests from forks never get one.

The preview uses the live settings (`src/config.js`), and workers.dev isn't localhost, so the online extras would write to the live project: open its game only with `#debug`. Use it to check the landing page, the routing and the headers, not to play.

## Preview on real phones

The preview uses the staging Firebase project and `pmlm-preview.` storage keys, so it never touches real progress, the live leaderboard or live stats.

```bash
tools/deploy-preview.sh
```

It builds `build/preview/`, pushes it to the `Rendorf/pmlm-preview` repository (creating it and turning on Pages the first time), and prints https://rendorf.github.io/pmlm-preview/. Send a test reminder on staging:

```bash
node tools/admin/send-reminders.mjs --env staging --only <device id>
```

Until `src/config.preview.js` has a staging web config, the preview has no online features. One-time setup is in the README under "Releasing safely".

## Backup and restore

Before publishing new rules or merging a release, back up the live database. It only reads, and writes a JSON file outside the repository (the file holds family data, so never commit it). Use `--out <dir>` to choose the folder.

```bash
node tools/admin/backup-firestore.mjs --key ~/.config/pmlm/live-service-account.json
```

Restore writes every document in the backup back. Documents not in the backup are left alone.

```bash
node tools/admin/backup-firestore.mjs --key ~/.config/pmlm/live-service-account.json --restore <backup.json> --yes
```

Timestamps are saved as `{ "__ts": ms }` and come back as timestamps.

## Publishing `firestore.rules`

Rules are **not** deployed by GitHub. Whenever `firestore.rules` changes:

1. Take a backup.
2. The owner opens Firebase console → Firestore Database → Rules, pastes the whole file and presses Publish, on the live project. Do the same on the staging project for the preview.
3. Publish before merging a change whose code needs the new rules, otherwise those writes are refused on the live site.

## Daily reminders

- `.github/workflows/reminders.yml` runs `tools/admin/send-reminders.mjs` at 5 minutes past every hour, and can be run by hand (Actions → Daily reminders → Run workflow) with a device id from the `push` collection (`only`) or as a `dry_run`.
- It reads every `push/{uid}`, asks `PMLM_REMINDERS.plan()` in `src/reminders.js` whether to send, sends a Web Push, and records `lastSent` and `lastMsg`. Subscriptions that answer 404 or 410 are deleted.
- The message carries no address. A tap opens the address the device subscribed from (`sw.js` opens its own scope), so an old pmlm.uk subscription opens the landing page, which sends the device on to play.pmlm.uk. The landing page also turns that old subscription off when it moves a device.
- A device gets at most one message a day, at the hour a grown-up chose (or the hour after, if the job ran late), only on days nobody on it has played: daily for 3 missed days, then every 3rd day, stopping after 14 days.
- Without the secrets `FIREBASE_SERVICE_ACCOUNT` and `VAPID_PRIVATE_KEY` it exits quietly and stays green.
- **60-day pause:** GitHub pauses scheduled workflows after 60 days with no change to the repository. Re-enable it under Actions → Daily reminders.
- One-time key setup: `node tools/admin/setup-push.mjs` (README → Daily reminders). It refuses to replace an existing key without `--force`, because new keys stop every existing subscription.

## Rollback

**Fastest:** Cloudflare dashboard → Workers & Pages → the Worker → Deployments → the last good version → **Rollback** (or `wrangler rollback` in `tools/deploy`). play.pmlm.uk and pmlm.uk serve it again at once. It lasts only until the next deploy from `main`, and it doesn't touch the old GitHub Pages address, so follow it with a revert.

Undo a merged pull request. Once the revert is on `main` and its tests pass, the Deploy workflow publishes the old version (GitHub Pages takes 1–2 minutes), and everyone's progress is kept (the progress tests check rollback).

```bash
git revert -m 1 <merge commit>
```

Because `main` is protected, push the revert on a branch and merge it through a pull request like any other change.

To switch off one online feature for everyone without a rollback, set it to `false` in `PMLM_FEATURES` in `src/config.js` (`stats`, `feedback`, `leaderboard`, `reminders`, `invites`, `crowd`), rebuild and release.

## Monitoring

- `stats.html` on the live site: play stats, feedback, the invite funnel. Sign in with Google; the account must be in the `admins` collection (added by the owner in the Firebase console).
- Parents → Devices and parents: each linked device's last-seen date, browser and version.
- Failed questions are logged in `player.diag` (synced) and as `problem` events.

## Moving the game to play.pmlm.uk

pmlm.uk served the game until October 2026; now it is the landing page and the game is at play.pmlm.uk. Browsers keep progress per address, so the old GitHub address and pmlm.uk each send a device on once, with its progress (`src/move.js`, `src/landing.js`; see [UX flows](../design/ux-flows.md#11-moving-to-playpmlmuk)). A browser only moves once `https://play.pmlm.uk/move.json` answers; until then pmlm.uk says the progress is safe and offers **Keep playing here** (`/?stay=1`). The iPhone/iPad code screen waits for the same check. The owner's steps, in order:

1. **Cloudflare deploy settings:** make the API token and add the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` and the variable `CF_WORKER_NAME` ([Deploy workflow](#deploy-workflow)). The token needs Account → Workers Scripts → Edit.
2. **Custom domain:** in Cloudflare, add `play.pmlm.uk` to the same Worker (Settings → Domains & Routes → Custom domain), next to pmlm.uk. Wait until it is active.
3. **Firebase:** Authentication → Settings → Authorized domains → add `play.pmlm.uk`. If the browser API key has website restrictions in Google Cloud, add it there too. Without this, parent login and linking fail on the new address.
4. **Before merging:** label the pull request `preview` and check that the Deploy run's preview upload is green (and, if workers.dev is on, the preview address: the landing page at `/welcome`, the game only with `#debug`). Take a [backup](#backup-and-restore).
5. **After merging:** the Deploy run is green, and both `curl` checks in [Release](#release) pass.
6. **One real move on your own devices:** a browser that played on pmlm.uk opens pmlm.uk and lands on play.pmlm.uk with its players; on an iPhone, an old Home Screen icon shows **Copy progress code**, and the new icon takes it.
7. **Tell families** what they do once: parents log in again on play.pmlm.uk; each child's device is linked again with a new code; **🔒 Plays as** is set again; daily reminders are turned on again; on iPhone and iPad, follow the four steps on the old icon and delete it only after the new icon shows the players.

Keep GitHub Pages running, and keep pmlm.uk serving `sw.js`: devices that installed the game there still need it (`check-live.sh` checks it).

## Other owner tools

- `node tools/make-icons.mjs` redraws the PNG app icons from `icons/icon.svg`.
- `cd tests && npm run shots` takes the landing page's pictures again (`landing/*.jpg`, `tests/make-landing-shots.mjs`): it rebuilds, then plays a local build with made-up players, a fixed clock and the mock family backend (`build/synctest.html`), so no real account or Firebase project is touched. Commit `landing/` (and the rebuilt pages) with the change. `python3 build.py --check` fails if a picture the page uses is missing or over 200 KB.
- Publishing the claude.ai copy: build, then publish `build/artifact.html` with the Artifact tool to the artifact URL in `CLAUDE.md`.
