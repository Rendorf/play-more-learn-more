// Background music, composed live with Web Audio (no audio files): a song for each world and four moods (lofi
// cozy, calm focus, adventure, party), each played with that world's instruments. compose() and bar() are pure
// (song data, and one bar's note events), so they can be tested without sound. The rest plays those events on
// the audio clock it shares with Sfx, crossfades between songs, and adds layers as the combo grows.
const Music = (() => {
  // ---------- Composition ----------
  const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], minor: [0, 2, 3, 5, 7, 8, 10] };
  // A tune is "step:degree:length" in 16th notes across a 4-bar phrase; degrees count up the song's scale from its key
  const ph = s => s.trim().split(/\s+/).map(t => t.split(':').map(Number));

  // Each world keeps its key, instruments, percussion and ambience in every style, and has its own song
  const WORLDS = {
    space: {
      name: 'Space', key: 60, lead: 'synth', chord: 'pluck', bass: 'bass', amb: 'shimmer',
      song: {
        title: 'Starhop', bpm: 112, scale: 'major', progA: [0, 4, 5, 3], progB: [3, 4, 2, 5], comp: 'arp16', bassPat: 'pulse8', kit: 'electro', pad: true,
        A: ph('0:7:2 2:7:2 4:6:2 6:7:2 8:9:4 12:8:4 16:7:2 18:6:2 20:4:4 24:5:2 26:4:6 32:5:2 34:7:2 36:9:4 40:8:2 42:7:2 44:8:4 48:7:4 52:5:4 56:3:4 60:4:4'),
        end: ph('48:4:2 50:6:2 52:7:12'),
        B: ph('0:5:6 6:6:2 8:7:8 16:8:6 22:7:2 24:6:8 32:4:4 36:6:4 40:9:8 48:8:4 52:7:4 56:5:8'),
      },
    },
    ocean: {
      name: 'Ocean', key: 65, lead: 'steel', chord: 'marimba', bass: 'bass', amb: 'waves',
      song: {
        title: 'Island Hop', bpm: 104, scale: 'major', progA: [0, 3, 4, 0], progB: [5, 3, 0, 4], comp: 'offbeat', bassPat: 'calypso', kit: 'island', pad: true,
        A: ph('0:4:3 3:4:3 6:5:2 8:7:4 12:5:4 16:3:3 19:3:3 22:4:2 24:5:4 28:3:4 32:4:3 35:6:3 38:7:2 40:8:4 44:7:4 48:4:3 51:2:3 54:0:2 56:2:4 60:1:4'),
        end: ph('48:4:3 51:2:3 54:1:2 56:0:8'),
        B: ph('0:5:3 3:6:3 6:7:2 8:9:8 16:8:3 19:7:3 22:5:2 24:3:8 32:2:3 35:4:3 38:7:2 40:9:4 44:8:4 48:7:3 51:6:3 54:5:2 56:4:8'),
      },
    },
    jungle: {
      name: 'Jungle', key: 62, lead: 'marimba', chord: 'kalimba', bass: 'bass', amb: 'birds',
      song: {
        title: 'Vine Swing', bpm: 108, scale: 'dorian', progA: [0, 3, 6, 3], progB: [2, 6, 3, 4], comp: 'arp8', bassPat: 'jungle', kit: 'tribal', pad: true,
        A: ph('0:0:2 2:2:2 4:4:4 8:3:2 10:4:2 12:6:4 16:7:4 20:6:2 22:4:2 24:3:8 32:4:2 34:6:2 36:7:2 38:9:2 40:8:4 44:6:4 48:7:4 52:4:4 56:3:2 58:2:2 60:1:4'),
        end: ph('48:4:4 52:2:2 54:1:2 56:0:8'),
        B: ph('0:2:4 4:4:4 8:7:8 16:6:4 20:4:4 24:2:8 32:3:4 36:5:4 40:7:4 44:8:4 48:9:8 56:7:8'),
      },
    },
    candy: {
      name: 'Candy', key: 67, lead: 'musicbox', chord: 'pluck', bass: 'bounce', amb: 'sparkle',
      song: {
        title: 'Sugar Rush', bpm: 118, scale: 'major', progA: [0, 5, 3, 4], progB: [3, 0, 4, 5], comp: 'bounce', bassPat: 'bounce', kit: 'pop', pad: false,
        A: ph('0:7:2 2:4:2 4:5:2 6:7:2 8:9:4 12:7:4 16:8:2 18:5:2 20:6:2 22:8:2 24:10:4 28:8:4 32:9:2 34:7:2 36:5:2 38:7:2 40:8:4 44:6:4 48:7:2 50:6:2 52:5:2 54:4:2 56:5:4 60:6:4'),
        end: ph('48:7:2 50:9:2 52:8:2 54:6:2 56:7:8'),
        B: ph('0:5:2 2:7:2 4:9:4 8:8:2 10:7:2 12:5:4 16:6:2 18:8:2 20:10:4 24:9:2 26:8:2 28:6:4 32:7:2 34:9:2 36:11:4 40:10:2 42:9:2 44:7:4 48:8:4 52:6:4 56:4:8'),
      },
    },
  };

  // Moods: the same tune in every world, played by that world's instruments in the world's key
  const MOODS = {
    lofi: {
      name: 'Lofi cozy', bpm: 78, swing: 0.58, scale: 'major', progA: [1, 4, 0, 5], progB: [3, 2, 1, 4], sevenths: true,
      comp: 'keys7', chord: 'epiano', bassPat: 'lofi', kit: 'lofi', pad: false, lp: 2600, verb: 0.22, wobble: 1, crackle: true,
      A: ph('4:4:4 10:2:2 12:4:4 20:6:6 28:5:4 36:4:4 42:2:2 44:1:4 52:0:8'),
      end: ph('48:2:4 52:0:12'),
      B: ph('0:7:6 8:6:4 16:4:8 32:5:6 40:4:4 48:2:8'),
    },
    calm: {
      name: 'Calm focus', bpm: 66, scale: 'major', progA: [0, 3, 5, 4], progB: [5, 3, 0, 4],
      comp: 'pad', bassPat: 'calm', kit: 'none', pad: false, lp: 5200, verb: 0.38, ambQuiet: true,
      A: ph('0:4:8 12:7:4 24:6:8 36:4:4 48:2:8 60:4:4'),
      end: ph('48:2:4 52:0:12'),
      B: ph('0:9:8 16:7:8 32:5:8 48:4:16'),
    },
    adventure: {
      name: 'Adventure', bpm: 120, scale: 'minor', progA: [0, 5, 2, 6], progB: [5, 6, 0, 4],
      comp: 'brass', bassPat: 'pulse8', kit: 'adventure', pad: true,
      A: ph('0:0:6 6:4:2 8:7:8 16:5:6 22:4:2 24:2:8 32:3:6 38:4:2 40:5:4 44:7:4 48:6:12 60:4:4'),
      end: ph('48:4:4 52:2:4 56:0:8'),
      B: ph('0:7:4 4:9:4 8:10:8 16:9:4 20:7:4 24:5:8 32:4:4 36:5:4 40:7:8 48:6:8 56:4:8'),
    },
    party: {
      name: 'Party', bpm: 124, scale: 'major', progA: [5, 3, 0, 4], progB: [3, 4, 5, 0],
      comp: 'offbeat', chord: 'pluck', bassPat: 'offoct', kit: 'party', pad: false,
      A: ph('0:9:2 3:9:2 6:9:2 8:8:2 10:7:4 14:5:2 16:7:2 19:7:2 22:7:2 24:8:2 26:9:4 30:7:2 32:9:2 35:9:2 38:9:2 40:11:2 42:10:4 46:9:2 48:8:4 52:7:4 56:5:4 60:4:4'),
      end: ph('48:8:2 50:9:2 52:7:12'),
      B: ph('0:5:4 4:7:4 8:9:8 16:8:4 20:7:4 24:5:8 32:4:4 36:5:4 40:7:4 44:9:4 48:11:8 56:12:8'),
    },
  };
  const STYLES = [
    { id: 'theme', name: 'World song', icon: '🎵' }, { id: 'lofi', name: 'Lofi cozy', icon: '☕' }, { id: 'calm', name: 'Calm focus', icon: '🌙' },
    { id: 'adventure', name: 'Adventure', icon: '🗺️' }, { id: 'party', name: 'Party', icon: '🎉' },
  ];

  // Drum patterns: steps (0-15) per drum
  const KITS = {
    electro: { kick: [0, 8], clap: [4, 12], hat: [2, 6, 10, 14] },
    island: { kick: [0, 8], shaker: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], bongoH: [3, 11, 14], bongoL: [6] },
    tribal: { log: [0, 3, 6, 10, 12], tomL: [0, 8], bongoH: [4, 7, 14], shaker: [0, 2, 4, 6, 8, 10, 12, 14] },
    pop: { kick: [0, 8], clap: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14] },
    lofi: { kick: [0, 7, 10], snare: [4, 12], hat: [2, 6, 10, 14] },
    adventure: { kick: [0, 8], snare: [12], tomL: [0, 3, 6], tomH: [10, 11, 14] },
    party: { kick: [0, 4, 8, 12], clap: [4, 12], ohat: [2, 6, 10, 14] },
    none: {},
  };
  const DRUM_GAIN = { kick: 1, snare: 0.8, clap: 0.8, hat: 0.6, ohat: 0.6, shaker: 0.5, tomL: 0.8, tomH: 0.8, bongoH: 0.7, bongoL: 0.7, log: 0.7, crash: 0.6 };
  // Bass: [step, semitones above the chord root, length]
  const BASS = {
    pulse8: [0, 2, 4, 6, 8, 10, 12, 14].map(s => [s, 0, 2]),
    calypso: [[0, 0, 5], [6, 7, 2], [8, 0, 3], [12, 7, 3]],
    jungle: [[0, 0, 4], [6, 0, 2], [10, 7, 2], [12, 12, 3]],
    bounce: [0, 2, 4, 6, 8, 10, 12, 14].map(s => [s, s % 4 ? 12 : 0, 2]),
    lofi: [[0, 0, 6], [10, 7, 4], [14, 0, 2]],
    calm: [[0, 0, 16]],
    offoct: [[0, 0, 2], [2, 12, 2], [6, 12, 2], [10, 12, 2], [14, 12, 2]],
  };

  const deg = (key, scale, d) => key + 12 * Math.floor(d / 7) + scale[((d % 7) + 7) % 7];
  const hash = n => ((n + 1) * 2654435761) >>> 0;

  // The song for a style in a world: tempo, harmony, tunes, patterns, instruments and mix
  function compose(style, world) {
    const w = WORLDS[world] || WORLDS.space, base = style === 'theme' || !MOODS[style] ? w.song : MOODS[style];
    const id = style === 'theme' || !MOODS[style] ? 'theme' : style;
    return {
      id: `${id}.${world in WORLDS ? world : 'space'}`, style: id, world: world in WORLDS ? world : 'space',
      title: id === 'theme' ? w.song.title : `${base.name} · ${w.name}`,
      bpm: base.bpm, swing: base.swing || 0.5, scale: SCALES[base.scale], key: w.key, sevenths: !!base.sevenths,
      progA: base.progA, progB: base.progB, A: base.A, end: base.end, B: base.B,
      comp: base.comp, bassPat: base.bassPat, kit: base.kit, pad: base.pad,
      lead: w.lead, chord: base.chord || w.chord, bass: id === 'theme' ? w.bass : (base.bassPat === 'offoct' ? 'bounce' : 'bass'),
      amb: w.amb, ambGain: base.ambQuiet ? 0.6 : 1, crackle: !!base.crackle,
      lp: base.lp || 16000, verb: base.verb == null ? 0.16 : base.verb, wobble: base.wobble || 0,
    };
  }

  // The note events for bar n of a song (32 bars: A A B A', looping). energy 0-4 adds layers; boss adds drums.
  // Each event: { at: step 0-16 (16ths, swing applied), v: voice, n: MIDI note or null, len: steps, g: gain }
  function bar(song, n, energy = 0, boss = false) {
    const ev = [], b = ((n % 32) + 32) % 32, loop = Math.floor(n / 32), sec = b < 16 ? 'A' : b < 24 ? 'B' : 'A2';
    const prog = sec === 'B' ? song.progB : song.progA, inPh = b % 4, half = Math.floor((b % 8) / 4);
    const root = prog[inPh], sc = song.scale, key = song.key;
    const triad = [0, 2, 4].concat(song.sevenths ? [6] : []).map(i => deg(key - 12, sc, root + i));
    const bassRoot = deg(key - 24, sc, root);
    const e = boss ? Math.max(2, energy) : energy, calm = song.kit === 'none';
    const swing = s => s + (s % 4 === 2 ? (song.swing - 0.5) * 4 : s % 2 === 1 ? (song.swing - 0.5) * 2 : 0);
    const add = (at, v, nn, len, g) => ev.push({ at: Math.min(15.99, swing(at)), v, n: nn, len, g });

    // Tune: A sections end on the tonic every second phrase; A' lifts its first phrase an octave
    const ending = sec !== 'B' && half === 1 && inPh === 3;
    const tune = ending ? song.end : sec === 'B' ? song.B : song.A;
    const lift = (sec === 'A2' && half === 0) || (loop % 2 === 1 && b >= 8 && b < 12) ? 7 : 0;
    for (const [s, d, len] of tune) {
      if (Math.floor(s / 16) !== inPh) continue;
      let m = deg(key, sc, d + lift) + (song.lead === 'musicbox' ? 12 : 0);
      while (m > 96) m -= 12;   // keep high instruments sweet, never shrill
      add(s % 16, song.lead, m, len, 1);
      if (e >= 3 && !calm) add(s % 16, song.lead, m + 12 <= 100 ? m + 12 : m - 12, len, 0.35);
    }

    // Chords
    const top = triad[triad.length - 1];
    if (song.pad || song.comp === 'pad') { add(0, 'pad', null, 16, song.comp === 'pad' ? 1 : 0.6); ev[ev.length - 1].chord = triad; }
    const stab = (s, len, g) => triad.forEach(m => add(s, song.chord, m + 12, len, g / triad.length * 2));
    if (song.comp === 'arp16' || (e >= 2 && !calm && song.comp !== 'arp16')) {
      const pat = [0, 1, 2, 1, 0, 1, 2, 3];
      for (let s = 0; s < 16; s++) { const i = pat[s % 8]; add(s, song.chord, (i === 3 ? triad[0] + 12 : triad[i]) + 12, 1, song.comp === 'arp16' ? 0.7 : 0.35); }
    }
    if (song.comp === 'offbeat') [2, 6, 10, 14].forEach(s => stab(s, 1.5, 0.7));
    if (song.comp === 'arp8') for (let s = 0; s < 16; s += 2) add(s, song.chord, triad[[0, 2, 1, 2][(s / 2) % 4]] + 12, 2, 0.75);
    if (song.comp === 'bounce') [0, 3, 6, 8, 11, 14].forEach(s => stab(s, 1, 0.6));
    if (song.comp === 'keys7') { stab(0, 7, 0.8); stab(10, 5, 0.6); }
    if (song.comp === 'brass') { triad.forEach(m => add(0, 'brass', m + 12, 6, 0.5)); triad.forEach(m => add(8, 'brass', m + 12, 4, 0.4)); }
    if (calm && e >= 1) [4, 12].forEach(s => add(s, song.chord, top + 24, 4, 0.35));

    // Bass
    for (const [s, iv, len] of BASS[song.bassPat] || []) add(s, song.bass, bassRoot + iv, len, song.bassPat === 'calm' ? 0.5 : 1);

    // Drums: a short breakdown at the start of B (unless the combo is up), more as the combo grows
    const kit = KITS[song.kit] || {}, breakdown = sec === 'B' && b < 18 && e < 2;
    for (const [d, steps] of Object.entries(kit)) {
      if (breakdown && (d === 'kick' || d === 'snare' || d === 'clap' || d === 'tomL')) continue;
      for (const s of steps) add(s, d, null, 1, DRUM_GAIN[d] * (d === 'shaker' && s % 2 ? 0.6 : 1));
    }
    if (!calm) {
      if (e >= 1) for (let s = 1; s < 16; s += 2) add(s, 'hat', null, 1, 0.35);
      if (e >= 2 && !kit.kick) [0, 8].forEach(s => add(s, 'kick', null, 1, 0.7));
      if (e >= 2 && (song.kit === 'electro' || song.kit === 'pop' || song.kit === 'island')) [4, 12].forEach(s => add(s, 'kick', null, 1, 0.8));
      if (e >= 4 && b % 4 === 0) add(0, 'crash', null, 8, 0.8);
      if ((e >= 4 || boss) && b % 4 === 3) [12, 13, 14, 15].forEach(s => add(s, 'snare', null, 1, 0.5 + (s - 12) * 0.12));
      if (boss) [2, 10].forEach(s => add(s, 'tomL', null, 1, 0.7));
    }

    // Ambience
    const ag = song.ambGain;
    if (song.amb === 'shimmer' && b % 2 === 0) add(0, 'shimmer', top + 24, 16, 0.8 * ag);
    if (song.amb === 'waves' && b % 2 === 0) add(0, 'waves', null, 32, ag);
    if (song.amb === 'birds' && hash(n) % 3 === 0) add(hash(n) % 2 ? 6 : 10, 'bird', 90 + (hash(n) % 5), 1, ag);
    if (song.amb === 'sparkle' && b % 2 === 1) add(14, 'sparkle', top + 24, 2, ag);
    if (song.crackle) add(0, 'crackle', null, 16, 1);
    return ev;
  }

  // ---------- Instruments (Web Audio) ----------
  const freq = m => 440 * Math.pow(2, (m - 69) / 12);
  // Builds the music chain into a destination and returns its instruments. Used live and for test renders.
  function chainFor(ac, dest) {
    const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    // A small room: decaying noise as the reverb's impulse
    const ir = ac.createBuffer(2, Math.floor(ac.sampleRate * 2.2), ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3); }
    const vol = ac.createGain(), comp = ac.createDynamicsCompressor(), lp = ac.createBiquadFilter(), wob = ac.createDelay(0.05);
    const verb = ac.createConvolver(), send = ac.createGain(), input = ac.createGain(), lfo = ac.createOscillator(), depth = ac.createGain();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
    lp.type = 'lowpass'; lp.frequency.value = 16000; lp.Q.value = 0.5;
    wob.delayTime.value = 0.006; lfo.frequency.value = 0.55; depth.gain.value = 0;
    lfo.connect(depth); depth.connect(wob.delayTime); lfo.start();
    verb.buffer = ir; send.gain.value = 0.16;
    input.connect(lp); lp.connect(wob); wob.connect(comp);
    input.connect(send); send.connect(verb); verb.connect(comp);
    comp.connect(vol); vol.connect(dest);

    function env(g, t, peak, a, dur, sustain) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
      if (sustain) { g.gain.setTargetAtTime(peak * sustain, t + a, dur * 0.3); g.gain.setTargetAtTime(0.0001, t + dur, 0.08); }
      else g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + 0.01, dur));
    }
    function osc(out, type, f, t, dur, peak, o = {}) {
      const s = ac.createOscillator(), g = ac.createGain();
      s.type = type; s.frequency.setValueAtTime(f, t);
      if (o.slide) s.frequency.exponentialRampToValueAtTime(o.slide, t + (o.slideT || dur));
      if (o.detune) s.detune.value = o.detune;
      env(g, t, peak, o.a || 0.005, dur, o.sus);
      s.connect(g); g.connect(o.to || out);
      s.start(t); s.stop(t + dur + (o.sus ? 0.6 : 0.05));
      return g;
    }
    function filt(out, type, f, q = 0.7) { const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; fl.connect(out); return fl; }
    function hiss(out, t, dur, peak, type, f, q, a) {
      const s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = noise; s.loop = true;
      env(g, t, peak, a || 0.002, dur);
      s.connect(g); g.connect(filt(out, type, f, q));
      s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.05);
    }
    const V = {
      synth: (o, t, d, m, g) => { const f = filt(o, 'lowpass', 2600); osc(o, 'square', freq(m), t, d, 0.07 * g, { to: f, a: 0.01, sus: 0.6 }); osc(o, 'square', freq(m), t, d, 0.05 * g, { to: f, a: 0.01, sus: 0.6, detune: 9 }); },
      pluck: (o, t, d, m, g) => { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.25); f.connect(o); osc(o, 'sawtooth', freq(m), t, Math.min(0.35, d + 0.15), 0.09 * g, { to: f }); },
      pad: (o, t, d, m, g, ev) => { const f = filt(o, 'lowpass', 1100); (ev.chord || [m]).forEach(n => [-7, 7].forEach(dt => osc(o, 'sawtooth', freq(n), t, d, 0.018 * g, { to: f, a: 0.4, sus: 0.85, detune: dt }))); },
      bass: (o, t, d, m, g) => { osc(o, 'triangle', freq(m), t, d * 0.95, 0.3 * g, { sus: 0.7 }); osc(o, 'sine', freq(m), t, d * 0.95, 0.22 * g, { sus: 0.7 }); },
      bounce: (o, t, d, m, g) => { const f = filt(o, 'lowpass', 800); osc(o, 'square', freq(m), t, Math.min(0.24, d), 0.2 * g, { to: f }); osc(o, 'sine', freq(m), t, d * 0.9, 0.34 * g, { sus: 0.65 }); },
      steel: (o, t, d, m, g) => { const f0 = freq(m); [[1, 0.13], [2, 0.06], [3.01, 0.03], [4.2, 0.015]].forEach(([k, p]) => osc(o, 'sine', f0 * k, t, Math.max(0.5, d * 0.9), p * g, { a: 0.004 })); },
      marimba: (o, t, d, m, g) => { const f0 = freq(m); osc(o, 'sine', f0, t, 0.6, 0.16 * g); osc(o, 'sine', f0 * 4, t, 0.09, 0.06 * g); },
      kalimba: (o, t, d, m, g) => { const f0 = freq(m); osc(o, 'sine', f0, t, 0.9, 0.12 * g); osc(o, 'sine', f0 * 5.4, t, 0.12, 0.035 * g); },
      musicbox: (o, t, d, m, g) => { const f0 = freq(m); osc(o, 'sine', f0, t, 1.3, 0.1 * g); osc(o, 'sine', f0 * 3, t, 0.4, 0.03 * g); osc(o, 'sine', f0 * 5.2, t, 0.2, 0.015 * g); },
      epiano: (o, t, d, m, g) => { const f0 = freq(m); osc(o, 'sine', f0, t, Math.max(1, d), 0.09 * g, { a: 0.008 }); osc(o, 'sine', f0 * 2, t, 0.6, 0.025 * g); },
      brass: (o, t, d, m, g) => { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2200, t + 0.12); f.frequency.setTargetAtTime(1400, t + 0.12, 0.2); f.connect(o); [0, 6].forEach(dt => osc(o, 'sawtooth', freq(m), t, d, 0.03 * g, { to: f, a: 0.04, sus: 0.75, detune: dt })); },
      kick: (o, t, d, m, g) => osc(o, 'sine', 150, t, 0.35, 0.55 * g, { slide: 45, slideT: 0.12 }),
      snare: (o, t, d, m, g) => { hiss(o, t, 0.18, 0.22 * g, 'bandpass', 1800, 0.8); osc(o, 'triangle', 190, t, 0.1, 0.12 * g); },
      clap: (o, t, d, m, g) => [0, 0.012, 0.024].forEach(x => hiss(o, t + x, 0.13, 0.17 * g, 'bandpass', 1300, 1.2)),
      hat: (o, t, d, m, g) => hiss(o, t, 0.04, 0.06 * g, 'highpass', 7200),
      ohat: (o, t, d, m, g) => hiss(o, t, 0.22, 0.05 * g, 'highpass', 6500),
      shaker: (o, t, d, m, g) => hiss(o, t, 0.06, 0.05 * g, 'bandpass', 5500, 1),
      tomL: (o, t, d, m, g) => osc(o, 'sine', 115, t, 0.32, 0.36 * g, { slide: 70 }),
      tomH: (o, t, d, m, g) => osc(o, 'sine', 185, t, 0.24, 0.3 * g, { slide: 120 }),
      bongoH: (o, t, d, m, g) => osc(o, 'sine', 430, t, 0.1, 0.2 * g, { slide: 380 }),
      bongoL: (o, t, d, m, g) => osc(o, 'sine', 290, t, 0.14, 0.22 * g, { slide: 250 }),
      log: (o, t, d, m, g) => { osc(o, 'sine', 720, t, 0.09, 0.14 * g); osc(o, 'sine', 1450, t, 0.05, 0.05 * g); },
      crash: (o, t, d, m, g) => hiss(o, t, 1.4, 0.07 * g, 'highpass', 4200),
      shimmer: (o, t, d, m, g) => [1, 1.5, 2].forEach(k => osc(o, 'sine', freq(m) * k, t, d, 0.012 * g, { a: 0.6, sus: 0.7 })),
      waves: (o, t, d, m, g) => hiss(o, t, d, 0.045 * g, 'lowpass', 520, 0.6, d * 0.4),
      bird: (o, t, d, m, g) => [0, 0.11, 0.2].forEach((x, i) => osc(o, 'sine', freq(m) * (1 + i * 0.06), t + x, 0.08, 0.022 * g, { slide: freq(m) * 1.4, slideT: 0.06 })),
      sparkle: (o, t, d, m, g) => [0, 0.09].forEach((x, i) => osc(o, 'sine', freq(m + i * 5), t + x, 0.4, 0.03 * g)),
      crackle: (o, t, d, m, g) => { for (let i = 0; i < 9; i++) hiss(o, t + Math.random() * d, 0.004, 0.06 * g, 'highpass', 2500); },
    };
    return {
      input, vol, lp, send, depth,
      // Mix settings for a song: lofi warms the top and wobbles a little, calm gets more room
      mix(song, at) { lp.frequency.setTargetAtTime(song.lp, at, 0.2); send.gain.setTargetAtTime(song.verb, at, 0.2); depth.gain.setTargetAtTime(song.wobble * 0.0012, at, 0.2); },
      // Plays one bar's events into out, starting at time t
      play(song, events, t, out, humanize) {
        const step = 60 / song.bpm / 4;
        for (const e of events) {
          const fn = V[e.v];
          if (!fn) continue;
          const jit = humanize ? (Math.random() - 0.5) * 0.008 : 0, gv = humanize ? 0.92 + Math.random() * 0.16 : 1;
          fn(out, Math.max(ac.currentTime, t + e.at * step + jit), e.len * step, e.n, e.g * gv, e);
        }
      },
    };
  }

  // ---------- Player ----------
  let ac = null, ch = null, cur = null, playing = false, started = false, paused = false, timer = 0, plays = 0;
  let want = { style: 'theme', world: 'space' }, on = true, vol = 50, energy = 0, scene = 'menu';
  const level = v => Math.pow(Math.max(0, Math.min(100, v)) / 100, 1.6) * 0.9;

  // Start a song on its own gain, so the previous one can fade out underneath
  function begin() {
    const song = compose(want.style, want.world), g = ac.createGain(), t = ac.currentTime + 0.08;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1, t + 0.6);
    g.connect(ch.input);
    if (cur) { const old = cur.gain; old.gain.cancelScheduledValues(ac.currentTime); old.gain.setTargetAtTime(0.0001, ac.currentTime, 0.18); setTimeout(() => old.disconnect(), 2500); }
    cur = { song, gain: g, n: 0, next: t };
    ch.mix(song, t);
    plays++;
  }
  function tick() {
    if (!playing || !cur) return;
    const barLen = 60 / cur.song.bpm * 4;
    while (cur.next < ac.currentTime + 0.25) {
      ch.play(cur.song, bar(cur.song, cur.n, scene === 'menu' ? 0 : energy, scene === 'boss'), cur.next, cur.gain, true);
      cur.next += barLen; cur.n++;
    }
  }
  function run() {
    if (playing || !on || !started || paused) return;
    const a = typeof Sfx !== 'undefined' && Sfx.audio();
    if (!a) return;
    if (!ch || ac !== a.ac) { ac = a.ac; ch = chainFor(ac, a.master); cur = null; }
    ch.vol.gain.setValueAtTime(level(vol), ac.currentTime);
    playing = true; begin();
    timer = setInterval(tick, 25); tick();
  }
  function halt() {
    if (!playing) return;
    playing = false; clearInterval(timer); timer = 0;
    if (cur) { const old = cur.gain; old.gain.setTargetAtTime(0.0001, ac.currentTime, 0.12); setTimeout(() => old.disconnect(), 1500); cur = null; }
  }
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (playing) { paused = true; halt(); } } else if (paused) { paused = false; run(); }
  });

  return {
    STYLES, WORLDS, compose, bar,
    // The first tap or key press: the browser now lets the game make sound
    start() { started = true; run(); },
    setOn(v) { on = !!v; if (on) run(); else halt(); },
    setWorld(w) { const x = w in WORLDS ? w : 'space'; if (x === want.world) return; want.world = x; if (playing) begin(); },
    setStyle(s) { const x = s === 'theme' || MOODS[s] ? s : 'theme'; if (x === want.style) return; want.style = x; if (playing) begin(); },
    setVolume(v) { vol = Math.max(0, Math.min(100, +v || 0)); if (ch) ch.vol.gain.setTargetAtTime(level(vol), ac.currentTime, 0.05); },
    // 'menu' plays the plain song; 'round' adds layers with the combo; 'boss' starts at energy 2 with more drums
    setScene(s) { scene = s === 'round' || s === 'boss' ? s : 'menu'; if (scene === 'menu') energy = 0; },
    setEnergy(t) { energy = Math.max(0, Math.min(4, t | 0)); },
    // Lower the music for a moment so a celebration's fanfare stands out
    duck() {
      if (!ch || !playing) return;
      const g = ch.vol.gain, now = ac.currentTime, full = level(vol);
      g.cancelScheduledValues(now); g.setTargetAtTime(full * 0.3, now, 0.05); g.setTargetAtTime(full, now + 1.3, 0.35);
    },
    title: (style, world) => compose(style, world).title,
    state: () => ({ playing, on, started, paused, style: want.style, world: want.world, song: cur && cur.song.id, title: cur && cur.song.title, energy, scene, volume: vol, plays }),
    // Renders seconds of a song offline and measures it (for the sound check in the tests)
    async render(style, world, seconds = 6, e = 0) {
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, rate = 44100;
      const oac = new OAC(2, rate * seconds, rate), c = chainFor(oac, oac.destination), song = compose(style, world);
      c.vol.gain.value = level(50); c.mix(song, 0);
      const barLen = 60 / song.bpm * 4;
      for (let n = 0, t = 0.05; t < seconds; n++, t += barLen) c.play(song, bar(song, n, e), t, c.input, false);
      const buf = await oac.startRendering();
      let peak = 0, sum = 0, count = 0;
      for (let k = 0; k < buf.numberOfChannels; k++) { const d = buf.getChannelData(k); for (let i = 0; i < d.length; i++) { const x = Math.abs(d[i]); if (x > peak) peak = x; sum += x * x; count++; } }
      return { peak, rms: Math.sqrt(sum / count) };
    },
  };
})();
