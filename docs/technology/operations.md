# Operations

**Who this is for:** the owner, and any engineer who releases a change or looks after the live game.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

The pull request template (`.github/pull_request_template.md`) has the full release checklist. This page explains each step.

## Release

`main` is protected: nobody pushes to it directly. A change goes live only through a pull request whose **test** check passes on a branch that is up to date with `main`.

1. Work on a branch. Rebuild after changing `src/`, and commit `index.html`, `stats.html` and `manifest.webmanifest` with the source.

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

5. GitHub Pages updates 1–2 minutes after the merge. Check the live build stamp:

```bash
curl -s https://pmlm.uk/ | grep "const BUILD"
```

6. **Children's devices must reload** to get the new version. The service worker caches nothing, so a reload is enough. A parent's Devices list shows each linked device's version and says "reload it" when it is behind.

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
- A device gets at most one message a day, at the hour a grown-up chose (or the hour after, if the job ran late), only on days nobody on it has played: daily for 3 missed days, then every 3rd day, stopping after 14 days.
- Without the secrets `FIREBASE_SERVICE_ACCOUNT` and `VAPID_PRIVATE_KEY` it exits quietly and stays green.
- **60-day pause:** GitHub pauses scheduled workflows after 60 days with no change to the repository. Re-enable it under Actions → Daily reminders.
- One-time key setup: `node tools/admin/setup-push.mjs` (README → Daily reminders). It refuses to replace an existing key without `--force`, because new keys stop every existing subscription.

## Rollback

Undo a merged pull request. The old version is back in 1–2 minutes and keeps everyone's progress (the progress tests check rollback).

```bash
git revert -m 1 <merge commit>
```

Because `main` is protected, push the revert on a branch and merge it through a pull request like any other change.

To switch off one online feature for everyone without a rollback, set it to `false` in `PMLM_FEATURES` in `src/config.js` (`stats`, `feedback`, `leaderboard`, `reminders`, `invites`), rebuild and release.

## Monitoring

- `stats.html` on the live site: play stats, feedback, the invite funnel. Sign in with Google; the account must be in the `admins` collection (added by the owner in the Firebase console).
- Parents → Devices and parents: each linked device's last-seen date, browser and version.
- Failed questions are logged in `player.diag` (synced) and as `problem` events.

## Other owner tools

- `node tools/make-icons.mjs` redraws the PNG app icons from `icons/icon.svg`.
- Publishing the claude.ai copy: build, then publish `build/artifact.html` with the Artifact tool to the artifact URL in `CLAUDE.md`.
