# Play More Learn More — content contract

Grade files (`src/grade1.js` … `src/grade9.js`, one per Cambridge stage 1–9) are plain browser scripts (no `import`/`export`, no modules).
They run after `src/util.js` and must only call `PMLM.registerUnit(...)` and `PMLM.registerSkill(...)`, using the `U` helpers.
Wrap the whole file in an IIFE: `(() => { ... })();` so nothing leaks into globals.

The game is themeable (Space, Ocean, Jungle, Candy), so **unit names and lesson text must be theme-neutral** — no
"planet", "island", "spaceship" etc. The engine decorates units per theme.

## Units

```js
PMLM.registerUnit({ id: 'g2.u1', grade: 2, name: 'Numbers to 100', icon: '🔢' });
```
- 4–6 units per grade, registered in teaching order. Every unit ends with an engine-made Boss round (you don't write it).
- `name`: short (≤ 22 chars), plain. `icon`: one emoji.

## Skills

```js
PMLM.registerSkill({
  id: 'g2.placeValue',        // unique; prefix g2. / g6. / g8.
  grade: 2,
  unit: 'g2.u1',              // a registered unit id; skills appear in registration order inside the unit
  title: 'Tens and ones',     // ≤ 26 chars
  icon: '🧱',                 // one emoji
  blurb: 'Split a number into tens and ones',   // ≤ 60 chars, shown on the skill card
  lesson: [                   // 3–5 cards; the LAST card is a worked example, step by step
    { title: 'Tens are groups of ten', text: '...', visual: { type: 'base10', n: 30 } },
    ...
  ],
  gen(level, ctx) {           // level is 1, 2 or 3 (3 = the full Cambridge stage expectation)
    return { q, kind, answer, ... };   // see Question
  }
});
```
`ctx` = `{ currency: '₼' }` (money symbol chosen by the parent; use `ctx.currency`, never hard-code a symbol).

## Question object (returned by `gen`)

| field | required | meaning |
|---|---|---|
| `q` | yes | The question text (markup allowed, see below). Keep it short; one idea. |
| `kind` | yes | `'number'`, `'fraction'`, `'choice'` or `'coord'` |
| `answer` | yes | `number` for number · `[num, den]` integers for fraction · string equal to one of `choices` for choice · `[x, y]` for coord |
| `choices` | choice only | 2–5 **distinct** strings, must contain `answer` exactly. Engine shuffles them. Markup allowed. |
| `simplest` | no | fraction: `true` = the child must give the fraction in simplest form (your `answer` must already be simplest) |
| `mixed` | no | fraction: `true` = show a whole-number box too (for mixed-number answers). Answer is still `[num, den]` (improper is fine) |
| `tolerance` | no | number: accept answers within ± this (e.g. circle area rounded to 1 d.p. → `0.05`). Default exact. |
| `prefix` / `unit` | no | short text shown before/after the answer box, e.g. `prefix: ctx.currency`, `unit: 'cm²'`, `unit: '°'` |
| `visual` | no | a picture spec (see Visuals) shown above the question |
| `hints` | yes | exactly 2 strings: `[nudge, workedStep]`. Nudge = a gentle reminder of the method. WorkedStep = the first concrete step done for them, leaving the last step to the child. Never give the final answer in a hint. |
| `explain` | yes | the full solution in 1–3 short sentences, ending with the answer. Shown after the 3rd wrong try, and on "Why?" after a right answer. |

Answer checking (engine):
- number: the child's input is parsed (`-`/`−`, decimals, commas ignored) and compared numerically. Never use number kind for answers that need a unit conversion the child can't type.
- fraction: equivalent fractions accepted unless `simplest: true`. Don't use fraction kind when the answer is a whole number — use number.
- Use `choice` for anything that isn't a single number/fraction/coordinate: algebra expressions, `<`/`>`/`=`, times on a clock, shape names, true/false, inequalities, recurring decimals, "which is bigger", etc.
- For numeric choice questions generate believable wrong options from **real mistakes** (e.g. forgot to carry, added instead of multiplied, place-value slip), not random numbers. `U.numChoices` helps.

## Text markup (in `q`, `hints`, `explain`, lesson `text`, `choices`, table cells)

- `**bold**`
- `{3/4}` → stacked fraction (numerator/denominator may be numbers, letters, `−`, spaces; no nested braces). Use `U.frac(n, d)` / `U.mixed(n, d)` to build them.
- `^{2}` → superscript, `_{1}` → subscript (e.g. `x^{2}`, `10^{−3}`)
- `~{3}` → recurring digits with dots above (e.g. `0.~{3}` is 0.3 recurring, `0.1~{6}`, `0.~{142857}`)
- `\n` → line break
- `□` (U+25A1) → a missing-number box, e.g. `□ + 7 = 15`
- Use `×` and `÷`, and `−` (U+2212) for minus/negative in text. `U.fmt(x)` formats numbers this way.

## Visuals (`visual: { type, ... }`) — the engine draws these as SVG

| type | fields |
|---|---|
| `base10` | `n` (0–999): hundreds flats, tens rods, ones cubes |
| `numberLine` | `min`, `max`, `step`, `labelEvery?` (label every k-th tick), `points?: [{at, label?}]`, `jumps?: [{from, to, label?}]` — decimals and negatives OK; ≤ 24 ticks. A point label `'?'` marks the unknown. |
| `array` | `rows`, `cols` (≤ 12 each), `emoji?` |
| `objects` | `groups: [n, …]` (≤ 10 groups, each ≤ 20), `emoji?` — items drawn in circled groups (sharing/grouping); one group = a plain set |
| `bond` | `whole`, `parts: [a, b]` — any of them may be `'?'` |
| `fractionBar` | `bars: [{parts, shaded, label?}]` (≤ 4 bars, parts ≤ 24) |
| `pie` | `pies: [{parts, shaded}]` (≤ 4 pies, parts ≤ 16) |
| `clock` | `h` (1–12), `m` (0–59) analog clock |
| `coins` | `values: [1, 2, 5, 10, 20, …]` money pieces in `ctx.currency` (≤ 2 drawn as coins, bigger as notes) |
| `shape2d` | `shape`: `circle`, `semicircle`, `triangle`, `rightTriangle`, `square`, `rectangle`, `parallelogram`, `trapezium`, `rhombus`, `kite`, `pentagon`, `hexagon`, `octagon`, `L`. Optional `dims` (label strings): rectangle/square/parallelogram/triangle/rightTriangle `{base, height}` · trapezium `{top, base, height}` · circle `{radius}` or `{diameter}` · `L` `{w, h, a, b}` = a w×h rectangle with an a-wide × b-tall rectangle cut from the top-right corner (labels on bottom w, left h, top-cut a, cut height b) |
| `shape3d` | `shape`: `cube`, `cuboid`, `cylinder`, `cone`, `sphere`, `squarePyramid`, `triangularPrism`; optional `dims` labels `{l, w, h}` (cuboid/prism/cube) or `{r, h}` (cylinder/cone) |
| `angle` | `mode`: `single` (`parts: [deg]`), `line` (parts sum 180), `point` (parts sum 360), `triangle` (3 parts sum 180); `labels`: same length as parts (`'65°'`, `'x'`, `'?'`). Parts are the TRUE sizes used for drawing. |
| `parallelLines` | `theta` (acute angle 20–80, the transversal rises to the right), `labels: {'A.tr': '65°', 'B.bl': 'x'}`. Two horizontal parallel lines; the transversal cuts the top line at A and the bottom line at B. Positions `tl`,`tr`,`bl`,`br` are the four angles round each crossing. True sizes: `tr = bl = theta`, `tl = br = 180 − theta`. So corresponding: A.tr = B.tr; alternate: A.bl = B.tr and A.br = B.tl; co-interior: A.br + B.tr = 180. |
| `polygon` | `n` (3–12) regular polygon, `show?: 'interior'|'exterior'`, `label?` |
| `grid` | `xmin, xmax, ymin, ymax` (default −5..5, span ≤ 20), `points?: [{x, y, label?}]`, `lines?: [{m, c, label?}]` (y = mx + c), `segments?: [{x1, y1, x2, y2}]`, `polygons?: [{pts: [[x,y],…], label?, ghost?}]` (ghost = dashed outline) |
| `barChart` | `bars: [{label, value}]` (≤ 8), `step?`, `yLabel?`, `title?` |
| `pictogram` | `rows: [{label, count}]`, `symbol` (emoji), `per?` (1, 2, 4, 5 or 10; a key is shown; part symbols drawn when count isn't a multiple), `title?` |
| `tally` | `rows: [{label, count}]` |
| `table` | `headers: [...]`, `rows: [[...], ...]` (strings/numbers, markup OK) |
| `bag` | `items: [{color, count}]` marbles in a bag; colors `red, blue, green, yellow, purple, orange`; total ≤ 20 |
| `spinner` | `sectors: [{label?, color?}]` equal sectors (≤ 12), same color names |
| `balance` | `left`, `right` strings (a pan balance for equations) |
| `barModel` | `rows: [{label, parts, value?}]`, `total?` — bar-model boxes for ratio/sharing/word problems |
| `placeValue` | `value` (string or number, e.g. `'4.736'`), `highlight?` = index of the digit to highlight (0 = first digit) — a place-value chart Th H T O . t h th |
| `sequence` | `terms: ['3', '7', '11', '?']`, `step?: '+4'` — boxes with arrows |
| `thermometer` | `value`, `min`, `max` (°C) |

Visuals must match the question numbers exactly (draw what the question says). Don't reveal the answer in the visual.

## Helpers (`U`, from `src/util.js`)

`U.rint(a,b)` inclusive · `U.pick(arr)` · `U.shuffle(arr)` · `U.sample(arr,k)` · `U.range(a,b,step?)` ·
`U.gcd` · `U.lcm` · `U.simplify(n,d)` → `[n,d]` · `U.frac(n,d)` → `'{n/d}'` · `U.fracS(n,d)` simplified · `U.mixed(n,d)` → `'1 {1/2}'` ·
`U.fmt(x, dp?)` number → string (float noise removed, `−` for negatives, thousands commas ≥ 10 000; `dp` fixes decimals) ·
`U.round(x, dp)` · `U.sigfig(x, n)` · `U.isPrime(n)` · `U.factors(n)` · `U.primeFactors(n)` (with repeats) ·
`U.choices(answer, distractors, n=4)` → shuffled distinct strings containing `String(answer)` (needs ≥ 1 valid distractor) ·
`U.numChoices(answer, {extra: [...], n: 4, min, dp})` → numeric choices (your `extra` distractors first, then near misses) ·
`U.term(coef, v, first)` / `U.expr([[coef, 'x'], [coef, ''], ...])` → algebra strings like `3x − 5` ·
`U.name()` random child name · `U.s(n, word, plural?)` → `'1 apple'`, `'3 apples'` · `U.ord(n)` → `'1st'`

## Style

- Write for a child who finds maths hard. Short sentences. Friendly, never babyish for older grades.
- Grade N ≈ age N + 5 (Grade 1 ≈ 6, Grade 2 ≈ 7, … Grade 9 ≈ 14). Grades 1–3: very simple words, small numbers at level 1, lots of pictures.
- Use Cambridge/British wording: "maths", "colour", "centimetres", "litres", "metres".
- Every lesson: what the idea is → a picture → a tip/trick → a worked example (the last card) with numbered steps.
- Level 1 = gentle entry, level 2 = typical, level 3 = the full stage expectation / small stretch.
- Vary question formats inside a skill (find the answer, find the missing number, spot the mistake, word problem).
- Never produce NaN, undefined, Infinity, negative lengths, division by zero, or trick questions with ambiguous answers.
