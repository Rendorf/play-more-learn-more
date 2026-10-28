# Architecture decisions

**Who this is for:** the owner and engineers who want to know why the game is built the way it is, before changing it.
**Last checked against:** BUILD 2026-10-28 10:20 UTC.

Each record explains one decision: what problem it solved, what was chosen, and what it costs. These first five were written after the fact from the code and its comments. Where the reason is not written down anywhere, the text says "(inferred)".

| # | Decision | Status |
|---|---|---|
| [0001](0001-single-file-no-framework.md) | One self-contained HTML file, no framework | Accepted |
| [0002](0002-firebase-rest-and-anonymous-auth.md) | Firebase SDK for family accounts, REST with its own anonymous account for the extras | Accepted |
| [0003](0003-per-player-docs-last-write-wins.md) | One document per player, newest `updatedAt` wins | Comparison rule superseded by 0006 |
| [0004](0004-push-only-service-worker.md) | A service worker for push only, with no caching | Accepted |
| [0005](0005-artifact-copy-uses-db-capability.md) | The claude.ai copy saves through the artifact `db` capability, not Firebase | Accepted |
| [0006](0006-more-progress-wins-and-rest-fallback.md) | More progress wins; saving falls back to REST when the live connection is stuck | Accepted |
| [0007](0007-landing-page-and-play-subdomain.md) | A landing page at pmlm.uk and the game at play.pmlm.uk, one Cloudflare Worker deployed by GitHub Actions | Accepted |

## Adding a record

Copy the template into `NNNN-short-title.md` with the next number, and add it to the table. Don't rewrite an accepted record: write a new one that supersedes it, and change the old one's status to "Superseded by NNNN".

```markdown
# NNNN. Title

**Who this is for:** …
**Last checked against:** BUILD …

**Status:** Proposed | Accepted | Superseded by NNNN
**Date:** YYYY-MM-DD

## Context
What problem or force made a decision necessary.

## Decision
What we chose, in a few sentences.

## Consequences
What gets easier, what gets harder, and what we must keep doing because of it.
```
