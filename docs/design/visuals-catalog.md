# Teaching pictures catalogue

**Who this is for:** content authors, designers and teachers who want to know which pictures the game can draw and where they are used.

**Last checked against:** BUILD 2026-10-25 18:32 UTC.

Questions and lesson cards can show a picture above the text. A content author writes a small spec like `visual: { type: 'clock', h: 3, m: 15 }`, and the game draws it as SVG (`src/visuals.js`). There are **26 types**. The exact fields, limits and rules are in [src/CONTRACT.md](../../src/CONTRACT.md); this page is the overview.

## How the pictures look

- Drawn live as SVG, so they are sharp on every screen. Max width 440 px, centred; on short screens max height 210 px.
- Coloured with the world's tokens (`--ink` for lines and labels, `--accent` for shaded parts and the unknown `?`, `--panel2` for empty parts, `--sky` and `--pop` for second and third colours). The same picture re-colours itself in Space, Ocean, Jungle and Candy.
- A few types use fixed colours that must mean the same in every world: marbles and spinner sectors (red, blue, green, yellow, purple, orange), and bar charts.
- Labels use the display font (Baloo 2), bold.
- The unknown is shown as **?** in the accent colour.
- If a spec can't be drawn, the picture is left out and the question still works. The in-game self-test (`#selftest`) draws every picture of every skill.

Two rules from the contract matter most for design:

1. **Draw what the question says.** The numbers in the picture match the question exactly.
2. **Don't give the answer away** in the picture.

## The 26 types

"Skills" is a sample of where each type appears (grade and skill title). Some types are used in many more skills.

| Type | What it shows | Main parameters | Typical skills |
|---|---|---|---|
| `angle` | One angle, angles on a line, angles round a point, or a triangle's angles, with arcs and labels (right angles get a square mark) | `mode`, `parts` (true sizes in degrees), `labels` | G4 Angles, G5 Triangles & quadrilaterals, G7 Angle rules |
| `array` | Rows and columns of dots or emoji | `rows`, `cols` (≤ 12), `emoji` | G2 Equal groups and arrays, G4 Times tables to 10 × 10, G6 Square and cube numbers |
| `bag` | A bag of coloured marbles | `items: [{color, count}]` (total ≤ 20) | G4 Chance, G7 Probability, G9 Combined events |
| `balance` | A pan balance with an expression on each side | `left`, `right` (text) | G1 Missing numbers, G7 Solving equations, G9 Linear equations |
| `barChart` | A bar chart with a scale | `bars: [{label, value}]` (≤ 8), `step`, `yLabel`, `title` | G2 Pictograms and charts, G4 Tables and charts, G6 Mean, median, mode, range |
| `barModel` | Bar-model boxes for parts, ratio and word problems | `rows: [{label, parts, value}]`, `total` | G3 Fractions of amounts, G5 Ratio and proportion, G8 Percentage change |
| `base10` | Hundreds flats, tens rods and ones cubes | `n` (0–999) | G1 Teen numbers, G2 Tens and ones, G3 Column addition |
| `bond` | A part–whole number bond (whole on top, two parts) | `whole`, `parts: [a, b]`, any can be `?` | G1 Number bonds, G2 Number bonds, G2 Missing numbers |
| `clock` | An analogue clock face | `h` (1–12), `m` (0–59) | G1 Telling the time, G3 Telling the time, G4 Time and timetables |
| `coins` | Money in the family's chosen currency symbol; small values as coins, larger as notes | `values: [1, 2, 5, 10, …]` | G1 Money, G2 Money, G3 Money and change |
| `fractionBar` | Up to 4 bars split into equal parts, some shaded | `bars: [{parts, shaded, label}]` | G2 Halves and quarters, G4 Equivalent fractions, G7 Fractions, decimals and % |
| `grid` | A coordinate grid with points, lines (y = mx + c), segments and shapes | `xmin…ymax`, `points`, `lines`, `segments`, `polygons` (with dashed "ghost" outlines) | G4 Coordinates, G8 Straight-line graphs, G9 Transformations |
| `numberLine` | A number line with ticks, marked points and jump arrows | `min`, `max`, `step`, `labelEvery`, `points`, `jumps` | G2 Add and subtract tens, G4 Negative numbers, G9 Linear inequalities |
| `objects` | Emoji in circled groups (sharing and grouping) or one plain set | `groups: [n, …]` (≤ 10 groups of ≤ 20), `emoji` | G1 Count to 20, G2 Sharing and grouping, G4 Divide with remainders |
| `parallelLines` | Two parallel lines cut by a transversal, with labelled angles | `theta` (20–80°), `labels: {'A.tr': '65°', …}` | G8 Angles and polygons, G9 Polygons and parallels |
| `pictogram` | A pictogram with a key, including part symbols | `rows: [{label, count}]`, `symbol`, `per` (1, 2, 4, 5 or 10), `title` | G1 Pictograms and tallies, G2 Pictograms and charts, G3 Charts and sorting |
| `pie` | Up to 4 circles split into equal sectors, some shaded | `pies: [{parts, shaded}]` | G2 Halves and quarters, G5 Mixed numbers, G9 Circles and sectors |
| `placeValue` | A place-value chart (Th H T O . t h th) with one digit highlighted | `value`, `highlight` | G4 Place value to 10 000, G6 Decimals and place value, G9 Standard form |
| `polygon` | A regular polygon, optionally showing interior or exterior angles | `n` (3–12), `show`, `label` | G4 Angles, G8 Angles and polygons, G9 Polygons and parallels |
| `sequence` | Boxes with arrows between terms | `terms: ['3', '7', '11', '?']`, `step` | G1 Patterns, G6 Sequences and formulae, G8 The nth term |
| `shape2d` | A flat shape with optional side labels (14 shapes, including an L-shape) | `shape`, `dims` | G1 Flat shapes, G6 Area and perimeter, G9 Pythagoras |
| `shape3d` | A solid shape with optional labels (cube, cuboid, cylinder, cone, sphere, square pyramid, triangular prism) | `shape`, `dims` | G1 Solid shapes, G7 Volume of cuboids, G9 Prisms and cylinders |
| `spinner` | A spinner with equal coloured sectors | `sectors: [{label, color}]` (≤ 12) | G4 Chance, G5 Probability, G8 Averages from tables |
| `table` | A simple data table (markup allowed in cells) | `headers`, `rows` | G4 Time and timetables, G7 Function machines, G9 Grouped data |
| `tally` | Tally marks in rows, grouped in fives | `rows: [{label, count}]` | G1 Pictograms and tallies, G2 Pictograms and charts, G4 Tables and charts |
| `thermometer` | A thermometer in °C with a scale | `value`, `min`, `max` | G4 Negative numbers, G6 Negative numbers, G7 Add and subtract integers |

## Most used

Counted by how many skills include each type in a lesson or question (approximate, from the grade files):

| Used in most skills | Used in fewest skills |
|---|---|
| `table`, `numberLine`, `objects`, `fractionBar`, `shape2d`, `grid`, `barModel`, `sequence` | `parallelLines`, `coins`, `tally`, `polygon`, `pictogram`, `thermometer` |

`numberLine`, `fractionBar`, `sequence`, `shape2d` and `table` appear in every grade from 1 to 9.

## Adding a new picture type

1. Add a renderer to `R_` in `src/visuals.js`, using the colour tokens, not fixed colours, unless the colour carries meaning.
2. Document its fields in `src/CONTRACT.md` (the single source of truth) and add a row here.
3. Add the type name to the `VISUALS` list in `src/validate.js`, so the checker and the self-test accept it.
4. Check it in all four worlds, and at phone width with a short screen (max height 210 px).
5. Give it a text alternative (see the gap on pictures in [accessibility.md](accessibility.md)).
