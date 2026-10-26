# 0001. One self-contained HTML file, no framework

**Who this is for:** engineers about to add a dependency, a bundler or a new source file.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

**Status:** Accepted

## Context

- Children play on whatever the family has, including older tablets. A dropped CSS selector list or an unsupported JS feature can silently break the whole page (noted in `CLAUDE.md`).
- The game must work offline and from a plain file (the README says to open `index.html` in any browser).
- It is hosted for free on GitHub Pages, with no server of its own.
- The same game is also published as a claude.ai artifact, which wants page content in one piece.
- A small team (one owner) maintains it. (inferred: no build toolchain to keep up to date.)

## Decision

- Write plain browser scripts and CSS in `src/`, with no framework and no npm dependencies at runtime.
- `build.py` (Python standard library only) inlines every file, in a fixed order, into one `index.html`, plus `stats.html`, the manifest and `build/artifact.html`.
- Generated files are committed, and `build.py --check` in the tests fails if they are stale.
- Modules share one global scope and expose a single object each (`U`, `PMLM`, `Board`, `Online`, …). Pure modules (`board.js`, `reminders.js`) avoid the DOM so Node can test them and the reminder sender can reuse them.

## Consequences

- Opening the page is one request; it works offline after it loads, and from `file:`.
- No dependency updates or bundler breakage. The only third-party code at runtime is the Firebase SDK, loaded on demand (see [0002](0002-firebase-rest-and-anonymous-auth.md)).
- The page is large (all 201 skills in one file), and every change downloads the whole page again. (inferred: accepted because it is still small next to typical web apps.)
- No module system: script order in `build.py` matters, and names can clash in the shared scope.
- Engineers must avoid very new CSS and JS features (for example `:is()`).
- Never edit `index.html` by hand; edit `src/` and rebuild.
