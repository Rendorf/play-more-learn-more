# Worlds and motion

**Who this is for:** designers and developers working on the look, feel and sound of the game, and anyone curious how the "arcade" part works.

**Last checked against:** BUILD 2026-10-25 18:32 UTC.

All of this is in `src/fx.js`: `THEMES` (the four worlds), `World` (the animated background), `FX` (celebration particles) and `Sfx` (sound effects, made live with the Web Audio API; there are no audio files). The background music is its own module, `Music` in `src/music.js`, on the same audio clock. The engine calls them from `src/engine.js`. Colours are in [design-system.md](design-system.md).

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

All sounds are synthesised. The music has its own chain (a gentle filter, a small room reverb and a compressor) and its own volume, under the effects.

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

Background music (`src/music.js`) starts on the first tap and plays everywhere at one level: menus, lessons and rounds. Re-drawing a screen never restarts it, and it pauses while the page is hidden.

**Styles.** Each child picks a style in the Me tab, and it is played in the current world's key, with that world's instruments, percussion and ambience:

| Style | Feel |
|---|---|
| World song (default) | Each world's own catchy song: Starhop (Space, synth-pop, 112 BPM), Island Hop (Ocean, calypso, 104), Vine Swing (Jungle, marimba and bongos, 108), Sugar Rush (Candy, bubblegum pop, 118) |
| Lofi cozy | 78 BPM with a lazy swing, soft drums, jazzy seventh chords on electric piano, vinyl crackle and a slight tape wobble |
| Calm focus | 66 BPM, no drums: slow pads, a few plucked notes and more room |
| Adventure | 120 BPM, minor key, toms and a brass-like swell |
| Party | 124 BPM, four-on-the-floor, offbeat hats and an octave bass |

| World | Lead and chords | Percussion | Ambience |
|---|---|---|---|
| Space | Synth lead, plucked arpeggios, a soft pad | Kick, clap, hats | A high shimmer |
| Ocean | Steel drum, marimba | Shakers, bongos | Waves |
| Jungle | Marimba, kalimba | Log drum, toms, bongos | Birds |
| Candy | Music box, bright plucks, a bouncy bass | Kick, clap, hats | Sparkles |

**Form.** Songs are 32 bars (A A B A′) and loop seamlessly: the hook repeats, the last A lifts an octave, and the B section opens with a short breakdown.

**In rounds.** Layers join as the combo grows (tier 1 extra hats, tier 2 an arpeggio and a steadier kick, tier 3 the tune doubled an octave up, tier 4 a crash and snare fills). A wrong answer drops back to tier 0. Boss battles start at tier 2 with extra drums. "Try it" and "Find my level" play the plain song.

**Changes.** A new world or style crossfades in about half a second. Celebrations dip the music for a moment so their fanfare stands out.

## Mute and reduced motion

| Control | What it does |
|---|---|
| 🔊 / 🔇 in the top bar | Turns sound effects **and** music off or on together. Key sounds go silent too. |
| Me → 🎵 Music | The child's style and the music volume |
| Parents → Settings → Sound effects | Effects only (key sounds follow this) |
| Parents → Settings → Background music, Music volume | Music only (on this device) |
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
