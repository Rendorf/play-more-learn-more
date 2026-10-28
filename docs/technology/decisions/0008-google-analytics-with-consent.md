# 0008. Google Analytics on the landing page and in the game, cookieless until a grown-up allows it

**Who this is for:** engineers changing `src/analytics.js`, `stat()` in `src/engine.js`, the landing page's banner or `PMLM_GA`, and the owner before sending anything new to Google.
**Last checked against:** BUILD 2026-10-28 (branch google-analytics).

**Status:** Accepted
**Date:** 2026-10-28

## Context

- The owner wants Google Analytics: how families find pmlm.uk (campaign links, search, social), how many go on to play, and which parts of the game they use.
- The game already has its own anonymous play stats (`events`, read on `stats.html`), but they say nothing about visitors who only read the landing page, or where visitors came from.
- The players are children. Google Analytics' terms require a privacy policy that discloses it and its cookies, and reasonable efforts to get consent for cookies. UK cookie rules and children's privacy laws (see [privacy-and-safety.md §7](../../product/privacy-and-safety.md#7-legal-posture-intent-not-a-claim)) point the same way: collect as little as possible and ask a grown-up first.

## Decision

- **Both the landing page (pmlm.uk) and the game (play.pmlm.uk), and nowhere else.** `Analytics.allowed()` checks for a `pmlm.uk` host, so the old GitHub address, workers.dev previews, the preview copy, local servers, `#debug`, `#selftest` and the claude.ai copy never load Google's script. `?gatest=1` runs it anywhere for tests.
- **Cookieless until a grown-up allows cookies.** Google's Consent Mode starts with `analytics_storage` denied, and `ad_storage`, `ad_user_data` and `ad_personalization` are always denied. A grown-up answers on the landing page's banner or in the game under Parents → Settings (behind the PIN); children are never asked. The answer is the cookie `pmlm_analytics=granted|denied` on `.pmlm.uk`, shared by both names, for a year. **No thanks** also removes Google's `_ga` cookies.
- **Advertising off:** `allow_google_signals: false`, `allow_ad_personalization_signals: false` and `ads_data_redaction`.
- **No ids, names or typed text.** In the game, `stat()` passes each stats event to `Analytics.track()`, which keeps only the fields listed in `Analytics.EVENTS` (grade, skill, mode, questions, right answers, seconds, …) and never `p`, `d`, `msg` or the campaign tag. Screens are page views at `/screen/<name>`. A grown-up's **Share anonymous play stats** switch stops both.
- **The landing page decides first.** Analytics starts only once `Landing.decide()` has chosen to show the page, never on the moving, stuck or code panels, so it can't delay a device moving on. Google's script loads with the first thing sent.
- **One switch:** `PMLM_GA` in `src/config.js` (empty in `config.preview.js`).

Considered and not chosen:

- **The landing page only.** This was the recommended option, keeping Google away from children's devices, but the owner wanted the game's usage in Analytics too.
- **Full cookies without asking.** Simpler, but against Google's terms and UK cookie rules.
- **Cookieless only, with no banner.** Analytics couldn't tell returning visitors apart.

## Consequences

- **Google sees children's devices.** Without cookies it still receives each device's internet address, browser and screen size with every hit. The privacy page says so, and the landing page's "What do you collect?" answer is the short public notice.
- **A full privacy notice is owed.** The TODOs in privacy-and-safety.md §7 now include Google Analytics as a processor.
- **The Analytics property needs settings outside the repository:** keep Google signals off, choose a short data retention, and register custom dimensions (grade, skill, mode, …) to see the event fields in reports.
- **Every new stats field is private until listed.** Adding a field to a `stat()` call doesn't send it to Google; it has to be added to `Analytics.EVENTS`, where the unit test checks that ids and text never are.
