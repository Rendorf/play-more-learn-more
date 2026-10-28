## What changes

<!-- What does this change do for children, parents or teachers? -->

## Before merging

Merge only when every box is ticked. Children's progress must never be lost.

**Automated** (GitHub runs `tests/run-all.sh`; it must be green)
- [ ] Tests ✅ on this pull request

**On real phones with the preview** (`tools/deploy-preview.sh`, then open https://rendorf.github.io/pmlm-preview/)
- [ ] iPhone: added to the Home Screen, opens from the icon as "PMLM Preview" with the red PREVIEW ribbon
- [ ] Android phone and a tablet: the game opens and plays
- [ ] New player → grown-up quick start → PIN → a wish saved
- [ ] A lesson, a practice round, a boss battle, Fix-it, the shop and a theme change all work
- [ ] 🏅 Top: you appear with a nickname; 🎲 changes it; this week / all time and the grade filter work
- [ ] Parents → Players: "First name" and "Hidden" change what the leaderboard shows
- [ ] 🚩 on a question and the "Tell us what you think" box both arrive on the preview's stats.html
- [ ] 🔔 Daily reminder: turned on (from the Home Screen app on iPhone), "Show a sample" appears, and a real reminder arrives (`node tools/admin/send-reminders.mjs --env staging --only <device id>`)
- [ ] Family account on the preview: parent login, link a second device, both see the same progress

**Cloudflare copy** (optional; for changes to the landing page, `functions/`, `_headers` or the deploy)
- [ ] Label `preview` and check the pages.dev copy from the Deploy run's summary: the landing page at `/welcome`, the game only with `#debug` (it uses the live project)

**Live project, before pressing Merge** (only when this pull request changes them)
- [ ] Backup taken: `node tools/admin/backup-firestore.mjs --key ~/.config/pmlm/live-service-account.json`
- [ ] New `firestore.rules` published in the Firebase console (live project)
- [ ] Reminder keys and secrets set (README → Daily reminders), and your account added to `admins`
- [ ] Rebased on the latest `main`, and the tests are green again

**After merging**
- [ ] Deploy workflow green on `main` (Actions → Deploy; it runs after the Tests pass on `main`)
- [ ] `curl -s https://play.pmlm.uk/ | grep "const BUILD"` shows the new version (and the same for the old address, https://rendorf.github.io/play-more-learn-more/, which moves devices on)
- [ ] `curl -s https://pmlm.uk/ | grep pmlm-page` shows the landing page
- [ ] On your own phone: a round, the leaderboard, stats.html, and a test reminder (Actions → Daily reminders → Run workflow with your device id)

If anything is wrong: Cloudflare → the Pages project → Deployments → **Rollback** to the last good one (at once, until the next deploy), then `git revert -m 1 <merge commit>` through a pull request (it keeps all progress), or switch one feature off in `PMLM_FEATURES` in `src/config.js`.
