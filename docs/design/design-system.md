# Design system

**Who this is for:** designers and developers changing how the game looks, and anyone who needs the exact colours, sizes or button rules.

**Last checked against:** BUILD 2026-10-25 18:32 UTC.

Everything here lives in one file: `src/shell.html` (markup and all CSS). There is no CSS framework. The world themes are in `src/fx.js` (`THEMES`). See [worlds-and-motion.md](worlds-and-motion.md) for animation and sound.

## Colour tokens

Each world is a complete set of tokens on `:root`. Space is the default (`:root`), and the others override it with `:root[data-world="ocean" | "jungle" | "candy"]`. The engine sets `data-world` on `<html>` from the current player's world (`applyTheme()` in `src/engine.js`).

| Token | Role | Space | Ocean | Jungle | Candy |
|---|---|---|---|---|---|
| `--bg` | Page background (outer) | `#0b1026` | `#03283c` | `#0c2416` | `#fff0f7` |
| `--bg2` | Page glow at the top | `#1c1f55` | `#064d6b` | `#1d4a26` | `#ffd9ec` |
| `--panel` | Cards, sheets | `#151c44` | `#0a3a55` | `#15361f` | `#ffffff` |
| `--panel2` | Raised items, default button face | `#222b62` | `#10506f` | `#1f4b2b` | `#fff4fa` |
| `--line` | Hairline outlines | `rgba(200,214,255,.16)` | `rgba(170,236,255,.18)` | `rgba(205,255,190,.16)` | `rgba(122,40,110,.16)` |
| `--ink` | Main text | `#eef1ff` | `#e9fcff` | `#f2fbe9` | `#3b1642` |
| `--muted` | Secondary text | `#a3aedb` | `#96cadb` | `#a9cc9d` | `#8b5f90` |
| `--accent` | Primary buttons, coins, highlights | `#ffd23f` | `#ffb54a` | `#ffd54a` | `#ff4fa3` |
| `--accent-ink` | Text on accent | `#2b1f00` | `#2e1700` | `#2a2000` | `#ffffff` |
| `--go` | Right answer, "go" buttons, progress | `#3ee6a8` | `#52f2c4` | `#8af27a` | `#12b77a` |
| `--go-ink` | Text on go | `#00261a` | `#002a1f` | `#0b2a00` | `#ffffff` |
| `--oops` | Wrong answer, delete | `#ff8593` | `#ff8a7d` | `#ff9270` | `#e5484d` |
| `--pop` | Boss, combo "hot", fun extras | `#ff6bd0` | `#ff8fc0` | `#ff78ad` | `#8b5cf6` |
| `--sky` | Focus ring, links, explanations | `#62d4ff` | `#6ce6ff` | `#74e6d4` | `#1f9fe8` |
| `--glow` | Pulsing glow | `rgba(255,210,63,.45)` | `rgba(255,181,74,.45)` | `rgba(255,213,74,.45)` | `rgba(255,79,163,.35)` |
| `--sidemix` | Mixed into a keycap's side | `#000` | `#000` | `#000` | `#5e1f57` |
| `--amb` | Soft shadow under keycaps | `rgba(0,0,0,.5)` | same | same | `rgba(122,40,110,.3)` |
| `color-scheme` | Native controls | dark | dark | dark | light |

Shared tokens (all worlds): `--font-display`, `--font-body`, `--r: 18px` (button radius), `--shadow: 0 6px 0 rgba(0,0,0,.28)` (Candy: `rgba(122,40,110,.16)`).

Rules:

- **Use tokens, never raw hex**, in screens and pictures. The few fixed colours are the theme preview cards (`.themecard.t-*`), the treasure chest SVG, marble and spinner colours in `src/visuals.js`, and the confetti palette in `src/fx.js`.
- **Meaning stays the same in every world.** `--go` always means right or go, `--oops` always means wrong or delete, `--accent` always means the main action or reward.
- Candy is the only light world. Check every new colour pair in Candy as well as Space. Contrast ratios are in [accessibility.md](accessibility.md).

## Keycap buttons

Every pressable control is drawn as a keyboard key: a lit **face**, a darker **side** underneath, and a soft **shadow**. One rule in `src/shell.html` styles them all; a component only sets two variables.

| Variable | Meaning | Default |
|---|---|---|
| `--face` | The colour of the top of the key | `var(--panel2)` |
| `--d` | How deep the side is (px) | `5px` |

### Anatomy

```css
.btn, .k, .choice, .iconbtn, .tab, .seg button, /* … plain list, no :is() */ {
  --side: color-mix(in srgb, var(--face, var(--panel2)) 62%, var(--sidemix));
  --cap: inset 0 2px 0 rgba(255,255,255,.3),        /* top highlight */
         inset 0 -3px 0 rgba(0,0,0,.15),            /* lower edge */
         0 var(--d, 5px) 0 var(--side),             /* the side */
         0 calc(var(--d, 5px) + 7px) 14px -7px var(--amb); /* soft shadow */
  background-color: var(--face, var(--panel2));     /* flat fallback */
  background-image: linear-gradient(180deg,         /* lit face */
    color-mix(in srgb, var(--face) 86%, #fff), var(--face) 52%, color-mix(in srgb, var(--face) 90%, #000));
  box-shadow: var(--cap);
  transform: translateY(var(--lift));
}
```

Number keys (`.k`) add a soft radial highlight so they look dished like a real keyboard key.

### States

| State | Trigger | What changes |
|---|---|---|
| Rest | — | Full side and shadow (`--cap`) |
| Hover | `:hover`, only on devices with a mouse (`@media (hover: hover)`) | Lifts 1 px |
| Pressed | `:active`, or `.pressed` added on `pointerdown` | Sinks by `--d − 1` px onto its side (`--cap-down`); key sound plays |
| Selected | `.tab.on`, `.seg button.on`, `.gradepick button.on`, answered `.choice[disabled]` | Stays pressed in |
| Selected with ring | `.avbtn.on`, `.famcard.on` | Pressed in plus a 3 px `--accent` inner ring |
| Current | `.node.current` (next skill on the map) | `--go` ring and a slow pulse |
| Disabled | `[disabled]` | No side, no shadow, `grayscale(.8) opacity(.5)` |

Transitions are 0.06 s, so the key feels instant.

### Variants and depth

| Class | Face | Text | Depth `--d` | Min height |
|---|---|---|---|---|
| `.btn` | `--panel2` | `--ink` | 6 px | 52 px |
| `.btn.primary` | `--accent` | `--accent-ink` | 6 px | 52 px |
| `.btn.go` | `--go` | `--go-ink` | 6 px | 52 px |
| `.btn.ghost` | `--panel2` at 55% | `--ink` | 6 px | 52 px |
| `.btn.small` | any of the above | — | 4 px | 40 px |
| `.btn.pulse` | adds a breathing `--glow` ring for the one action we want next | — | — | — |
| Destructive | inline `background: var(--oops)` with `#2a0006` text (delete player, reset) | — | — | — |
| `.k` (keypad) | `--panel2`; `.k.fn` darker; `.k.ok` = `--go`, two rows tall | — | 5 px | 58 px (46 px on short screens, 64 px on tall) |
| `.choice` | `--panel2`; `.right` = `--go`, `.wrong` = `--oops` | — | 5 px | 64 px |
| `.iconbtn` | round, `--panel` | — | 4 px | 40 × 40 px |
| `.tab` | `--panel`; `.on` mixes in `--accent` | — | 4 px | — |
| `.node` (map) | 78 px circle; `.s1`/`.s2`/`.s3` mix more `--accent` per star; `.boss` 92 px, `--pop` | — | 7 px | 78 px |

Every keycap also plays a switch sound when pressed (`Sfx.key`). Bigger keys sound deeper: larger than 9000 px² is "big", smaller than 2600 px² is "small" (`src/engine.js`).

## Typography

| Use | Font | Size | Weight |
|---|---|---|---|
| Body | Atkinson Hyperlegible | 16 px, line-height 1.45 | 400 / 700 |
| `h2` | Baloo 2 | 1.6 rem | 800 |
| `h3` | Baloo 2 | 1.2 rem | 700 |
| Logo | Baloo 2 | `clamp(2.6rem, 11vw, 4rem)`, tilted −3° / +2° | 800 |
| Question text `.qtext` | Baloo 2 | `clamp(1.3rem, 5vw, 1.75rem)`, centred | 700 |
| Lesson text `.ltext` | Atkinson Hyperlegible | 1.15 rem, line-height 1.55 | 400 |
| Buttons `.btn` | Baloo 2 | 1.15 rem | 800 |
| Keypad `.k` | Baloo 2 | 1.6 rem | 800 |
| Answer box `.ansbox` | Baloo 2 | 1.8 rem, tabular numbers | 800 |
| Eyebrow labels `.eyebrow` | Baloo 2 | 0.8 rem, uppercase, letter-spacing 0.08 em | 700 |
| Combo word `.popword` | Baloo 2 | `clamp(2.4rem, 12vw, 5rem)` | 800 |

- Fonts load from Google Fonts with fallbacks: "Arial Rounded MT Bold", "Trebuchet MS" for display; "Segoe UI", system-ui for body. Offline, the fallbacks are used.
- Numbers use `font-variant-numeric: tabular-nums` (`.num`, stats, answer boxes).
- Maths markup (`{3/4}`, `x^{2}`, `0.~{3}`) is drawn by `Rich.html` in `src/visuals.js` as stacked fractions, superscripts and recurring dots. Authors write it as described in `src/CONTRACT.md`.

## Spacing and radius

| Thing | Value |
|---|---|
| Side gutter | `max(16px, env(safe-area-inset-left/right))` |
| Vertical stack gap `.stack` | 14 px |
| Row and grid gap `.row`, `.grid2`, `.grid3` | 10 px |
| Card `.card` | padding 16 px, radius 22 px, 2 px inner `--line` outline |
| Question card `.qcard` | padding 18 px, radius 24 px |
| Button radius `--r` | 18 px |
| Keypad keys | radius 12 px, gap 8 px (6 px on short screens) |
| Bottom sheet | radius 28 px on top corners, max height 92% |
| Centred sheet `.overlay.mid` | radius 28 px, max width 520 px |
| Title row `.row.between > h2` | the title takes the free width and wraps beside its ✕; `.nobr` keeps a hyphenated word whole |
| Chips and bars | fully round (`999px`) |

Cards use an inner outline (`box-shadow: inset 0 0 0 2px var(--line)`) instead of a border, so they never change size when highlighted.

## Layout and breakpoints

The app is one centred column, **max 760 px wide**, floating over a full-screen animated world. On a tablet the column stays 760 px and the world fills the sides.

| Media query | Who it is for | What changes |
|---|---|---|
| (none) | Default, phones and tablets | 760 px column; auto-fill grids reflow by themselves |
| `max-width: 420px` | Small phones | Smaller tab labels, keys 52 px, shorter map labels, smaller progress ring |
| `max-height: 880px` | Short screens (most phones, landscape tablets) | Keys 46 px, tighter question card, pictures max 210 px tall, smaller mascot and choices |
| `min-height: 900px` | Tall screens (portrait tablets) | Keys 64 px |
| `hover: hover` | Mouse users | Hover lift on keycaps |
| `prefers-reduced-motion: reduce` | Anyone who asks for less motion | All CSS animation and transition times near zero |

Auto-fill grids set their own columns from a minimum width: wishes 150 px, family cards 230 px, theme cards 150 px, trophies 96 px, stickers 88 px, avatars 64 px. Choices are two columns, or one column when any choice is longer than 16 characters.

The manifest asks for **portrait** when installed on the Home Screen.

## Colour fallbacks

`color-mix()` is used for tints. Older tablets that don't support it need a plain colour first, because a background with an unknown function is dropped completely.

```css
.dcell.done i {
  background: #5a4310;                                                /* older browsers */
  background: color-mix(in srgb, var(--accent) 32%, var(--panel2));   /* newer browsers */
}
```

Where this is done today: `.dcell.done`, `.dcell.frozen`, `.sticker.got`. Keycaps set `background-color: var(--face)` before the gradient, so a key is at least flat-coloured. Some states set `--face` itself with `color-mix()` and have no fallback yet (see the gaps in [accessibility.md](accessibility.md)).

Other rules for older devices:

- No `:is()`, `:where()` or `:has()`. One unknown selector in a list drops the whole rule.
- New features that degrade quietly are fine (`text-wrap: balance`, `aspect-ratio`; `.dcell i` keeps a fixed height and only uses `aspect-ratio` inside `@supports`).

## Iconography

The game uses **emoji as its icon set**. There is no icon font and no SVG icon library.

| Rule | Example |
|---|---|
| One emoji per unit and per skill (`CONTRACT.md`) | 🔢 Numbers to 100, 🧱 Tens and ones |
| Tabs: one emoji above a short word | world emoji Play · 🎁 Wishes · 🏆 Me · 🏅 Top · 🔒 Parents |
| A fixed emoji means the same thing everywhere | 🪙 coins · 🧠 brain power · 🔥 streak and combo · 🧊 freeze · ⭐ star · 🔒 locked or grown-ups · 💡 hint · 👣 worked step · 🧩 explanation · 🚩 report · 🔊 read aloud |
| Icon-only buttons get an `aria-label` | ✕ "Close", 🔊 "Read aloud", 🔇 "Turn sound on" |
| Locked or not-yet-owned items are greyed with a filter, not swapped | `.wish.locked .we { filter: grayscale(1) opacity(.55) }` |
| Emoji in user text is allowed | Grown-ups pick one emoji per wish (4 characters max) |

Emoji look different on each platform (Apple, Google, Samsung, Windows). Design so the meaning survives any style: never rely on an emoji's colour alone.

Real SVG drawings are used only for: the 26 teaching pictures ([visuals-catalog.md](visuals-catalog.md)), the progress ring, the treasure chest and the app icon.

## App icons

| File | Size | Use |
|---|---|---|
| `icons/icon.svg` | 512 × 512 source | Drawn by hand; everything else is made from it |
| `icons/icon-192.png` | 192 px | Favicon, manifest, notification icon and badge |
| `icons/icon-512.png` | 512 px | Manifest |
| `icons/icon-maskable-512.png` | 512 px, `purpose: maskable` | Android adaptive icon |
| `icons/apple-touch-icon.png` | — | iPhone and iPad Home Screen |

- **The picture:** four keycap tiles with `+ − × ÷` on the Space night sky. The tiles use the Space tokens `--accent` `#ffd23f`, `--go` `#3ee6a8`, `--pop` `#ff6bd0` and `--sky` `#62d4ff`, each with a darker side drawn 10 px lower, like the in-game keys. The sky is a radial gradient from `#2b3080` to `#0b1026`.
- **Safe zone:** everything sits inside a 410 px circle, so one drawing works for round, square and maskable icons.
- **Redraw:** edit `icons/icon.svg`, then run `node tools/make-icons.mjs`.
- **Manifest:** name "Play More Learn More", short name "Play More", background and theme colour `#0b1026`, display `standalone`, orientation `portrait`. The preview copy is called "PMLM Preview" and shows a red PREVIEW ribbon.
