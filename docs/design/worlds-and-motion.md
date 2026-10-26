# Worlds and motion

**Who this is for:** designers and developers working on the look, feel and sound of the game, and anyone curious how the "arcade" part works.

**Last checked against:** BUILD 2026-10-25 18:32 UTC.

All of this is in `src/fx.js`: `THEMES` (the four worlds), `World` (the animated background), `FX` (celebration particles) and `Sfx` (sound and music, made live with the Web Audio API; there are no audio files). The engine calls them from `src/engine.js`. Colours are in [design-system.md](design-system.md).

## The four worlds

A child picks a world when making a player and can change it any time on the Me tab. The maths is the same in every world; only the decoration changes.

| | 🚀 Space | 🐠 Ocean | 🦁 Jungle | 🍭 Candy |
|---|---|---|---|---|
| Blurb on the card | Fly from planet to planet | Dive between treasure islands | Swing along the jungle trail | Hop across sweet candy lands |
| Mood | Deep navy night, yellow and mint | Deep teal sea, orange and aqua | Dark leaf green, yellow and lime | Light pink, hot pink and green |
| Mascot | 🤖 Blip | 🐙 Coral | 🐵 Mango | 🧸 Gummy |
| Map title | Galaxy map | Ocean map | Jungle trail | Candy road |
| Main button | Blast off! | Dive in! | Let's go! | Yum, go! |
| Unit nodes | Shiny planets, every other one with a ring | Little islands: green centre, sand, sea | Leafy green balls | Swirled lollipops |
| Background | Twinkling stars and drifting nebulas | Rising bubbles and light shafts | Falling leaves and fireflies | Falling sprinkles |
| Particles | ⭐ ✨ 🌟 🪐 ☄️ | 🫧 🐠 🐚 ⭐ 🐟 | 🍃 🍌 🌺 🦋 🌿 | 🍬 🍭 🧁 🍩 🍓 |
| Bosses (by unit) | 👾 👽 🛸 🦑 🐲 🤖 | 🦈 🦑 🐡 🐊 🐋 🦀 | 🐊 🐍 🦍 🐆 🦏 🐗 | 🦷 🍫 👹 🧟 🐲 🍰 |

Boss names are shared by all worlds: Grumble, Chomp, Zorg, Blobby, Munch, Rumble, Gloop ("Grumble the Boss").

The welcome screen, before any world is chosen, always shows Space and Blip. Reminder messages also mention Blip.

## Backgrounds

The background is drawn on a full-screen canvas (`#world`) behind the play column.

| World | What is drawn |
|---|---|
| Space | Three slowly drifting colour clouds (violet, blue, pink) and stars that fall at different speeds for depth and twinkle. |
| Ocean | Four slanting light shafts and bubbles that wobble upwards, each with a small highlight. |
| Jungle | Leaves in several greens that fall and spin, plus glowing yellow fireflies that wander. |
| Candy | Sprinkles and dots in six sweet colours that fall and turn. |

- The number of items scales with screen area, so a tablet isn't emptier than a phone.
- Drawing is capped at 2× pixel density and pauses when the tab is hidden.
- **Energy.** During a round, the combo tier (0–4) speeds the background up (`World.setEnergy`). From tier 2, stars stretch into streaks and the whole world shifts hue and gets a little brighter. A wrong answer or the end of the round resets it to 0.

## Combo tiers

Most motion and sound grow with the combo: answers right on the first try in a row.

| Tier | Combo | Extra effects (each tier adds to the one before) |
|---|---|---|
| 0 | 0–2 | Sparks from the question card |
| 1 | 3–4 | A burst of world particles; combo chip turns `--pop` and grows |
| 2 | 5–7 | Confetti; background speeds up and shifts hue |
| 3 | 8–11 | Fireworks, a rain of 🪙 coins, the screen shakes |
| 4 | 12+ | Bigger fireworks and a rain of the world's first particle (⭐, 🫧, 🍃 or 🍬) |

Pop words fly up in the middle of the screen at these combos: **COMBO ×3!**, **AWESOME ×5!**, **ON FIRE ×8!**, **MEGA ×12!**, **UNSTOPPABLE!** (15), **LEGENDARY!** (20), then **×25!!!**, **×30!!!** and so on.

## Celebration moments

| Moment | What the child sees and hears |
|---|---|
| Right answer | Card gets a `--go` ring, mascot jumps, a cheer in the speech bubble ("Nailed it!"), effects by combo tier, a rising chime |
| Wrong answer | Card gets an `--oops` ring and nudges sideways, mascot wobbles, combo resets, two soft falling notes |
| Boss hit | Boss emoji wobbles and flashes, health bar shrinks, a low thump |
| Perfect round (8+ answered, all right) | Confetti party on the results screen |
| Results screen | 1–3 stars pop in one by one; brain power counts up over 1.4 s |
| Big moments, one after another | Full-screen card with a large bouncing emoji, a title and a "Yay!" button; fanfare and confetti party for each |
| Wish unlocked, streak wish, family goal | The same card plus "Show a grown-up! 🎉" and a crowd cheer |
| New player made | Particle burst and fanfare |
| Treasure chest | The chest shakes until tapped, the lid flips open, the prize rises out; fanfare and a burst of the prize emoji |
| Theme change, buying an item, tapping the pet | Small particle burst and a coin sound (hearts ❤️ 💖 for the pet) |
| Grown-up marks a wish as granted | Confetti party |

The big-moment cards come after the results screen, in this order: boss beaten, skills mastered, album pages, wishes, streak milestone, streak wishes, pet hatched or grew, level up, family goal, invite gift, grade complete.

## Smaller motion

| Element | Motion |
|---|---|
| Mascot | Gentle bob (2.4 s loop); jump when right; wobble when wrong |
| `.btn.pulse` | A breathing glow ring around the one button we want tapped next |
| Current map node | Pulsing `--go` ring |
| Unlocked wish | Glowing `--go` outline |
| Sticker you own | A shine sweeps across every 4.5 s |
| Sleepy pet | Slow doze and floating 💤 |
| Sheets | Slide up from the bottom (0.25 s) |
| Lesson cards | Slide in from the right |
| Toasts | Slide in, fade out after about 3 s |

## Sound palette

All sounds are synthesised. Sound effects and music each have their own volume bus (music is quieter, 0.16 of the effects level).

| Sound | Made of | When it plays |
|---|---|---|
| Correct | A quick three-note rising chord on a pentatonic scale; the pitch climbs with the combo. Tier 1 adds a sparkle, tier 2 a bass drop, tier 3 a shimmer and chord, tier 4 the cheer. | Every right answer |
| Wrong | Two soft triangle notes going down | Every wrong answer |
| Coin | Two bright square-wave notes, like an arcade coin | Quest complete, buying, theme change, freeze bought, pet tap, new nickname |
| Hit | A low thump with a dull noise | Each right answer in a boss battle |
| Fanfare | A rising C major arpeggio and a held chord with bass | New player, chest opened, each big-moment card |
| Cheer | Crowd-like noise and a few claps | Wish and family-goal cards, and combo tier 4 |
| Key (`Sfx.key`) | A mechanical keyboard switch, see below | Every button press and release, and typing in a round |

### `Sfx.key`: the mechanical key sound

Every button sounds like a real keyboard key. A grown-up picks the style under Parents → Settings → Button sound (on this device).

| Style | Press | Release |
|---|---|---|
| Clicky (default) | A crisp click, a tiny metal tick and a short "tock" from the key body | A quieter high tick |
| Thocky | A deep, muted thock | A soft low tick |
| Off | Silent | Silent |

- Size changes the sound: big buttons sound a little deeper, small ones a little higher.
- Each press varies its pitch and level slightly, so it never sounds robotic.
- On phones that support it, each press also gives a 6 ms vibration.
- The sound starts on `pointerdown`, at the same moment the key sinks.

## Music

Music plays only during real rounds (practice, boss, Fix-it, the 60-second challenge). It does not play in "Try it", "Find my level", lessons or menus.

- A four-chord loop (I–V–vi–IV in C) on soft triangle waves: a bass note each half-bar and an arpeggio.
- Tempo starts at 100 BPM and adds 12 BPM per combo tier.
- Layers join as the combo grows: tier 1 hi-hat, tier 2 kick drum, tier 3 snare, tier 4 a fast square-wave arpeggio.
- A wrong answer drops back to tier 0; music stops at the end of the round or when leaving it.

## Mute and reduced motion

| Control | What it does |
|---|---|
| 🔊 / 🔇 in the top bar | Turns sound effects **and** music off or on together. Key sounds go silent too. |
| Parents → Settings → Sound effects | Effects only (key sounds follow this) |
| Parents → Settings → Music during rounds | Music only |
| Parents → Settings → Button sound | Clicky, Thocky or Off |
| Read aloud 🔊 | Only speaks when tapped; not affected by mute |
| Browser audio unlock | No sound plays before the first tap anywhere (browsers require this) |

When the device asks for **reduced motion** (`prefers-reduced-motion: reduce`):

- All CSS animations and transitions finish almost at once and do not loop (bob, pulse, shine, slides).
- The world background draws once and stays still; energy hue shifts are off.
- Particle effects are cut to about one sixth.
- Screen shake is off.
- Pop words effectively don't show (their animation ends at once).
- Sound and music are not changed by this setting.
