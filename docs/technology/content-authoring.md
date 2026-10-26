# Content authoring

**Who this is for:** engineers and content authors who add or change lessons, skills or question generators.
**Last checked against:** BUILD 2026-10-25 18:32 UTC.

The format for units, skills, questions, text markup and pictures is in [`src/CONTRACT.md`](../../src/CONTRACT.md). Read it first; this page is only the workflow.

## Adding or changing a skill

1. Edit the grade file, for example `src/grade6.js`. Each skill is registered with `PMLM.registerSkill` and belongs to a unit registered with `PMLM.registerUnit`.
2. Keep the skill `id` unchanged when you edit a skill. Saved progress is keyed by skill id, so a renamed id loses every child's stars and mastery for it.
3. Generators must never return an invalid question. Use the `U` helpers from `src/util.js`.
4. Run the checker on the grade file.
5. Read sample questions and check the maths yourself. The checker only finds format problems.
6. Rebuild, run the in-game self-test, and open a pull request (see [operations.md](operations.md)).

## The checker

Runs every generator many times per level (300 by default) and reports contract problems.

```bash
node tools/check-content.mjs src/grade6.js
```

Read 3 sample questions per skill and level:

```bash
node tools/check-content.mjs src/grade6.js --samples 3
```

Check one skill only:

```bash
node tools/check-content.mjs src/grade6.js --skill g6.rounding --samples 5
```

Check every grade (the tests run this):

```bash
node tools/check-content.mjs src/grade*.js
```

## Rebuild

```bash
python3 build.py
```

## In-game self-test

Start a local server from the repository root:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://localhost:8765/index.html#selftest`. It runs the same checks inside the browser, including drawing every picture. Then read `window.__selftest` in the browser console. It must show **201 skills** and **0 problems** (an empty `errors` list). The browser tests run it in Chromium and WebKit too.

If you add skills, the expected count changes. Update `CLAUDE.md` and `tests/e2e/selftest.spec.mjs`, which checks the count.

## When content changes

- Adding a skill to a unit locks that unit's boss battle until the child earns a star on the new skill, and lowers grade percentages a little. Wishes already unlocked stay unlocked.
- Removing a skill is a data change: old progress for it stays in `pmlm.v1` but is no longer shown. Prefer changing a skill to removing it.
- The curriculum map in [`../product/curriculum-map.md`](../product/curriculum-map.md) lists unit and skill titles from the grade files; update it after changing unit or skill titles.
