// Themes, animated world backgrounds, celebration particles and synthesized sound.
const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const THEMES = {
  space: {
    name: 'Space', emoji: '🚀', blurb: 'Fly from planet to planet', mascot: '🤖', mascotName: 'Blip',
    particles: ['⭐', '✨', '🌟', '🪐', '☄️'], bosses: ['👾', '👽', '🛸', '🦑', '🐲', '🤖'],
    mapTitle: 'Galaxy map', go: 'Blast off!', bg: 'stars',
    node: h => `radial-gradient(circle at 32% 28%, hsl(${h} 95% 78%), hsl(${h} 70% 50%) 55%, hsl(${h} 65% 26%))`, ring: true,
  },
  ocean: {
    name: 'Ocean', emoji: '🐠', blurb: 'Dive between treasure islands', mascot: '🐙', mascotName: 'Coral',
    particles: ['🫧', '🐠', '🐚', '⭐', '🐟'], bosses: ['🦈', '🦑', '🐡', '🐊', '🐋', '🦀'],
    mapTitle: 'Ocean map', go: 'Dive in!', bg: 'bubbles',
    node: h => `radial-gradient(circle at 50% 58%, hsl(${(h % 60) + 95} 60% 42%) 0 34%, #f3d58c 35% 52%, hsl(193 85% 46%) 53% 70%, hsl(197 80% 32%))`,
  },
  jungle: {
    name: 'Jungle', emoji: '🦁', blurb: 'Swing along the jungle trail', mascot: '🐵', mascotName: 'Mango',
    particles: ['🍃', '🍌', '🌺', '🦋', '🌿'], bosses: ['🐊', '🐍', '🦍', '🐆', '🦏', '🐗'],
    mapTitle: 'Jungle trail', go: "Let's go!", bg: 'leaves',
    node: h => `radial-gradient(circle at 35% 30%, hsl(${(h % 80) + 70} 70% 60%), hsl(${(h % 80) + 80} 60% 32%) 70%, hsl(120 50% 18%))`,
  },
  candy: {
    name: 'Candy', emoji: '🍭', blurb: 'Hop across sweet candy lands', mascot: '🧸', mascotName: 'Gummy',
    particles: ['🍬', '🍭', '🧁', '🍩', '🍓'], bosses: ['🦷', '🍫', '👹', '🧟', '🐲', '🍰'],
    mapTitle: 'Candy road', go: 'Yum, go!', bg: 'sprinkles',
    node: h => `conic-gradient(from 20deg, hsl(${h} 90% 70%), #fff 12%, hsl(${h} 90% 70%) 25%, #fff 37%, hsl(${h} 90% 70%) 50%, #fff 62%, hsl(${h} 90% 70%) 75%, #fff 87%, hsl(${h} 90% 70%))`,
  },
};

// ---------- Animated world background ----------
const World = (() => {
  let cv, g, W = 0, H = 0, dpr = 1, kind = 'stars', energy = 0, items = [], raf = 0, last = 0, t = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    items = [];
    const area = W * H / 10000;
    if (kind === 'stars') {
      for (let i = 0; i < area * 1.6; i++) items.push({ x: rnd(0, W), y: rnd(0, H), z: rnd(0.2, 1), tw: rnd(0, 6) });
    } else if (kind === 'bubbles') {
      for (let i = 0; i < area * 0.35; i++) items.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(2, 9), s: rnd(0.3, 1), ph: rnd(0, 6) });
    } else if (kind === 'leaves') {
      for (let i = 0; i < area * 0.18; i++) items.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(6, 14), s: rnd(0.3, 1), ph: rnd(0, 6), rot: rnd(0, 6), h: rnd(85, 140), fly: false });
      for (let i = 0; i < area * 0.12; i++) items.push({ x: rnd(0, W), y: rnd(0, H), fly: true, ph: rnd(0, 6), s: rnd(0.2, 0.6) });
    } else {
      const cols = ['#ff7eb6', '#7cc8ff', '#ffd75e', '#9b8cff', '#6ee7b7', '#ff9f68'];
      for (let i = 0; i < area * 0.5; i++) items.push({ x: rnd(0, W), y: rnd(0, H), s: rnd(0.3, 1), rot: rnd(0, 6), vr: rnd(-1, 1), c: cols[i % cols.length], dot: Math.random() < 0.35 });
    }
  }

  function frame(now) {
    const dt = Math.min(50, now - (last || now)) / 16.7; last = now; t += dt;
    const sp = 1 + energy * 0.9;
    g.clearRect(0, 0, W, H);
    if (kind === 'stars') {
      for (let i = 0; i < 3; i++) {
        const x = W * (0.2 + 0.3 * i) + Math.sin(t / 400 + i) * 60, y = H * (0.25 + 0.25 * (i % 2)) + Math.cos(t / 500 + i) * 40;
        const grd = g.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * 0.35);
        grd.addColorStop(0, `hsla(${[260, 200, 320][i]}, 80%, 60%, ${0.10 + energy * 0.03})`); grd.addColorStop(1, 'hsla(0,0%,0%,0)');
        g.fillStyle = grd; g.fillRect(0, 0, W, H);
      }
      for (const s of items) {
        s.y += s.z * s.z * 0.6 * sp * dt;
        if (s.y > H) { s.y = 0; s.x = rnd(0, W); }
        const a = 0.45 + 0.55 * Math.abs(Math.sin(t / 30 + s.tw));
        g.fillStyle = `rgba(255,255,255,${a * s.z})`;
        const r = s.z * 1.7;
        if (energy >= 2 && s.z > 0.7) { g.fillRect(s.x - r / 2, s.y - r * 4 * energy / 2, r, r * 4 * energy / 2); }
        g.beginPath(); g.arc(s.x, s.y, r, 0, 7); g.fill();
      }
    } else if (kind === 'bubbles') {
      for (let i = 0; i < 4; i++) {
        const x = W * (0.1 + i * 0.28) + Math.sin(t / 200 + i) * 30;
        const grd = g.createLinearGradient(x, 0, x + 140, H);
        grd.addColorStop(0, 'rgba(180,240,255,0.10)'); grd.addColorStop(0.6, 'rgba(180,240,255,0)');
        g.fillStyle = grd; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 70, 0); g.lineTo(x + 260, H); g.lineTo(x + 120, H); g.fill();
      }
      for (const b of items) {
        b.y -= b.s * 0.7 * sp * dt; b.x += Math.sin(t / 25 + b.ph) * 0.3;
        if (b.y < -10) { b.y = H + 10; b.x = rnd(0, W); }
        g.strokeStyle = 'rgba(200,245,255,0.55)'; g.lineWidth = 1.5;
        g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, 7); g.fill();
      }
    } else if (kind === 'leaves') {
      for (const l of items) {
        if (l.fly) {
          l.x += Math.sin(t / 60 + l.ph) * 0.5 * sp; l.y += Math.cos(t / 80 + l.ph) * 0.4 * sp;
          if (l.x < 0) l.x = W; if (l.x > W) l.x = 0; if (l.y < 0) l.y = H; if (l.y > H) l.y = 0;
          const a = 0.35 + 0.65 * Math.abs(Math.sin(t / 40 + l.ph));
          const grd = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, 9);
          grd.addColorStop(0, `rgba(255,240,140,${a})`); grd.addColorStop(1, 'rgba(255,240,140,0)');
          g.fillStyle = grd; g.beginPath(); g.arc(l.x, l.y, 9, 0, 7); g.fill();
          continue;
        }
        l.y += l.s * 0.6 * sp * dt; l.x += Math.sin(t / 40 + l.ph) * 0.6; l.rot += 0.01 * sp * dt;
        if (l.y > H + 20) { l.y = -20; l.x = rnd(0, W); }
        g.save(); g.translate(l.x, l.y); g.rotate(l.rot + Math.sin(t / 40 + l.ph) * 0.5);
        g.fillStyle = `hsla(${l.h}, 60%, 45%, 0.55)`;
        g.beginPath(); g.ellipse(0, 0, l.r, l.r * 0.45, 0, 0, 7); g.fill();
        g.strokeStyle = `hsla(${l.h}, 50%, 25%, 0.5)`; g.lineWidth = 1; g.beginPath(); g.moveTo(-l.r, 0); g.lineTo(l.r, 0); g.stroke();
        g.restore();
      }
    } else {
      for (const p of items) {
        p.y += p.s * 0.5 * sp * dt; p.rot += p.vr * 0.02 * sp * dt;
        if (p.y > H + 10) { p.y = -10; p.x = rnd(0, W); }
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.globalAlpha = 0.55; g.fillStyle = p.c;
        if (p.dot) { g.beginPath(); g.arc(0, 0, 4, 0, 7); g.fill(); }
        else { g.beginPath(); g.roundRect ? g.roundRect(-7, -2, 14, 4, 2) : g.rect(-7, -2, 14, 4); g.fill(); }
        g.restore();
      }
    }
    raf = REDUCED || document.hidden ? 0 : requestAnimationFrame(frame);
  }

  return {
    init(canvas) {
      cv = canvas; g = cv.getContext('2d');
      addEventListener('resize', resize);
      document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf && !REDUCED) raf = requestAnimationFrame(frame); });
      resize();
      raf = requestAnimationFrame(frame);
    },
    setTheme(themeId) {
      const k = (THEMES[themeId] || THEMES.space).bg;
      if (k !== kind) { kind = k; if (g) seed(); }
      if (REDUCED && g) requestAnimationFrame(frame);
    },
    setEnergy(tier) {
      energy = tier;
      if (cv) cv.style.filter = tier >= 2 && !REDUCED ? `hue-rotate(${(tier - 1) * 28}deg) saturate(${1 + tier * 0.12}) brightness(${1 + tier * 0.05})` : '';
    },
  };
})();

// ---------- Celebration particles ----------
const FX = (() => {
  let cv, g, W = 0, H = 0, dpr = 1, parts = [], raf = 0, theme = THEMES.space;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const COLS = ['#ffd23f', '#3ee6a8', '#ff6bd0', '#62d4ff', '#ff8593', '#a78bfa'];

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function loop() {
    g.clearRect(0, 0, W, H);
    parts = parts.filter(p => p.life > 0);
    for (const p of parts) {
      if (p.delay > 0) { p.delay--; continue; }
      p.vy += p.grav; p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      const a = Math.min(1, p.life / 30);
      g.save(); g.globalAlpha = a; g.translate(p.x, p.y); g.rotate(p.rot);
      if (p.kind === 'emoji') { g.font = `${p.size}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.e, 0, 0); }
      else if (p.kind === 'spark') { g.fillStyle = p.c; g.shadowColor = p.c; g.shadowBlur = 12; g.beginPath(); g.arc(0, 0, p.size, 0, 7); g.fill(); }
      else { g.fillStyle = p.c; g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
      g.restore();
    }
    raf = parts.length ? requestAnimationFrame(loop) : 0;
  }
  function add(list) {
    if (REDUCED) list = list.slice(0, Math.ceil(list.length / 6));
    parts.push(...list);
    if (!raf) raf = requestAnimationFrame(loop);
  }
  const P = o => Object.assign({ x: W / 2, y: H / 2, vx: 0, vy: 0, grav: 0.18, drag: 0.985, rot: 0, vr: 0, life: 90, size: 10, kind: 'confetti', c: COLS[0], delay: 0 }, o);

  const api = {
    init(canvas) { cv = canvas; g = cv.getContext('2d'); addEventListener('resize', resize); resize(); },
    setTheme(id) { theme = THEMES[id] || THEMES.space; },
    burst(x, y, count = 14, emojis = theme.particles, power = 6) {
      add(Array.from({ length: count }, () => {
        const a = rnd(0, Math.PI * 2), s = rnd(power * 0.4, power);
        return P({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, kind: 'emoji', e: emojis[Math.floor(Math.random() * emojis.length)], size: rnd(18, 30), vr: rnd(-0.1, 0.1), life: rnd(50, 80), grav: 0.15 });
      }));
    },
    sparks(x, y, count = 24) {
      add(Array.from({ length: count }, () => {
        const a = rnd(0, Math.PI * 2), s = rnd(2, 7);
        return P({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, kind: 'spark', c: COLS[Math.floor(Math.random() * COLS.length)], size: rnd(1.5, 3.5), life: rnd(35, 60), grav: 0.06, drag: 0.96 });
      }));
    },
    confetti(count = 120) {
      add(Array.from({ length: count }, () => P({ x: rnd(0, W), y: rnd(-H * 0.3, -10), vx: rnd(-2, 2), vy: rnd(1, 4), c: COLS[Math.floor(Math.random() * COLS.length)], size: rnd(8, 14), vr: rnd(-0.2, 0.2), life: rnd(120, 200), grav: 0.06, drag: 0.995 })));
    },
    fireworks(n = 4) {
      for (let i = 0; i < n; i++) setTimeout(() => {
        const x = rnd(W * 0.15, W * 0.85), y = rnd(H * 0.12, H * 0.45);
        api.sparks(x, y, 40); api.burst(x, y, 6, theme.particles, 5);
      }, i * 260);
    },
    rain(emoji = '🪙', count = 30) {
      add(Array.from({ length: count }, (_, i) => P({ x: rnd(0, W), y: -30, vx: rnd(-0.5, 0.5), vy: rnd(3, 6), kind: 'emoji', e: emoji, size: rnd(22, 34), vr: rnd(-0.1, 0.1), life: 160, grav: 0.12, drag: 1, delay: Math.floor(i * 2) })));
    },
    popWord(text) {
      document.querySelectorAll('.popword').forEach(e => e.remove());
      const el = document.createElement('div');
      el.className = 'popword'; el.textContent = text;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    },
    shake() {
      if (REDUCED) return;
      const app = document.getElementById('app');
      app.classList.remove('shake'); void app.offsetWidth; app.classList.add('shake');
    },
    // Escalating celebration for a correct answer at a given combo
    correct(combo, x, y) {
      const tier = comboTier(combo);
      api.sparks(x, y, 12 + tier * 6);
      if (tier >= 1) api.burst(x, y, 6 + tier * 3);
      if (tier >= 2) api.confetti(40 + tier * 20);
      if (tier >= 3) { api.fireworks(tier - 1); api.rain('🪙', 14); api.shake(); }
      if (tier >= 4) { api.fireworks(5); api.rain(theme.particles[0], 30); }
      const words = { 3: 'COMBO ×3!', 5: 'AWESOME ×5!', 8: 'ON FIRE ×8!', 12: 'MEGA ×12!', 15: 'UNSTOPPABLE!', 20: 'LEGENDARY!' };
      if (words[combo]) api.popWord(words[combo]);
      else if (combo > 20 && combo % 5 === 0) api.popWord(`×${combo}!!!`);
    },
    party() { api.confetti(160); api.fireworks(6); api.rain(theme.particles[0], 24); },
  };
  return api;
})();

function comboTier(c) { return c >= 12 ? 4 : c >= 8 ? 3 : c >= 5 ? 2 : c >= 3 ? 1 : 0; }

// ---------- Synthesized sound ----------
const Sfx = (() => {
  let ac, master, sfxBus, musicBus, noiseBuf, sfxOn = true, musicOn = true;
  let musicTimer = 0, nextNote = 0, step = 0, tier = 0, playing = false;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const PENTA = [0, 2, 4, 7, 9];

  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
      sfxBus = ac.createGain(); sfxBus.connect(master);
      musicBus = ac.createGain(); musicBus.gain.value = 0.16; musicBus.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, t0, dur, o = {}) {
    const osc = ac.createOscillator(), gn = ac.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t0 + dur);
    const v = o.vol == null ? 0.25 : o.vol;
    gn.gain.setValueAtTime(0.0001, t0);
    gn.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.008));
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gn); gn.connect(o.bus || sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, o = {}) {
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
    src.buffer = noiseBuf; src.loop = true;
    f.type = o.filter || 'highpass'; f.frequency.value = o.freq || 6000; f.Q.value = o.q || 0.7;
    const v = o.vol == null ? 0.1 : o.vol;
    gn.gain.setValueAtTime(0.0001, t0);
    gn.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.004));
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(gn); gn.connect(o.bus || sfxBus);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }
  const ok = () => sfxOn && ensure();

  // Music: I–V–vi–IV loop, tempo and layers rise with the combo tier
  const CHORDS = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
  function schedule() {
    if (!playing || !ac) return;
    const spb = 60 / (100 + tier * 12) / 2;
    while (nextNote < ac.currentTime + 0.12) {
      const bar = Math.floor(step / 8) % 4, s = step % 8, ch = CHORDS[bar], t0 = nextNote;
      if (s % 4 === 0) tone(mtof(ch[0] - 24), t0, spb * 3.5, { type: 'triangle', vol: 0.35, bus: musicBus });
      tone(mtof(ch[s % 3] + (s >= 4 ? 12 : 0)), t0, spb * 0.9, { type: 'triangle', vol: 0.12, bus: musicBus });
      if (tier >= 1 && s % 2 === 1) noise(t0, 0.05, { vol: 0.08, bus: musicBus });
      if (tier >= 2 && s % 4 === 0) tone(110, t0, 0.18, { type: 'sine', vol: 0.5, slide: 40, bus: musicBus });
      if (tier >= 3 && s % 4 === 2) noise(t0, 0.12, { filter: 'bandpass', freq: 1800, vol: 0.12, bus: musicBus });
      if (tier >= 4 && s % 2 === 0) tone(mtof(ch[(s / 2) % 3] + 24), t0, spb * 0.6, { type: 'square', vol: 0.04, bus: musicBus });
      nextNote += spb; step++;
    }
  }

  return {
    unlock() { if (sfxOn || musicOn) ensure(); },
    setSfx(v) { sfxOn = v; },
    setMusic(v) { musicOn = v; if (!v) this.stopMusic(); },
    startMusic() {
      if (!musicOn || playing || !ensure()) return;
      playing = true; nextNote = ac.currentTime + 0.1; step = 0;
      musicTimer = setInterval(schedule, 30);
    },
    stopMusic() { playing = false; clearInterval(musicTimer); musicTimer = 0; },
    setTier(t) { tier = t; },
    click() { if (!ok()) return; tone(1200, ac.currentTime, 0.04, { type: 'square', vol: 0.05 }); },
    correct(combo) {
      if (!ok()) return;
      const t = ac.currentTime, tr = comboTier(combo), base = 72 + PENTA[combo % 5] + 12 * (Math.floor(combo / 5) % 2);
      [0, 4, 7].forEach((iv, i) => tone(mtof(base + iv), t + i * 0.06, 0.22, { type: 'triangle', vol: 0.22 }));
      if (tr >= 1) [12, 16, 19, 24].forEach((iv, i) => tone(mtof(base + iv), t + 0.18 + i * 0.045, 0.16, { type: 'sine', vol: 0.12 }));
      if (tr >= 2) tone(mtof(base - 24), t, 0.35, { type: 'sine', vol: 0.4, slide: mtof(base - 36) });
      if (tr >= 3) { noise(t, 0.25, { filter: 'bandpass', freq: 3000, vol: 0.12 }); [0, 4, 7, 12].forEach(iv => tone(mtof(base + iv - 12), t + 0.3, 0.5, { type: 'sawtooth', vol: 0.05 })); }
      if (tr >= 4) this.cheer();
    },
    wrong() {
      if (!ok()) return;
      const t = ac.currentTime;
      tone(330, t, 0.16, { type: 'triangle', vol: 0.18 }); tone(247, t + 0.15, 0.26, { type: 'triangle', vol: 0.18 });
    },
    coin() { if (!ok()) return; const t = ac.currentTime; tone(988, t, 0.08, { type: 'square', vol: 0.07 }); tone(1319, t + 0.07, 0.22, { type: 'square', vol: 0.07 }); },
    hit() { if (!ok()) return; const t = ac.currentTime; tone(160, t, 0.25, { vol: 0.5, slide: 50 }); noise(t, 0.2, { filter: 'lowpass', freq: 900, vol: 0.25 }); },
    fanfare() {
      if (!ok()) return;
      const t = ac.currentTime;
      [60, 64, 67, 72].forEach((m, i) => tone(mtof(m), t + i * 0.12, 0.3, { type: 'triangle', vol: 0.22 }));
      [72, 76, 79, 84].forEach(m => tone(mtof(m), t + 0.5, 0.9, { type: 'triangle', vol: 0.12 }));
      tone(mtof(48), t + 0.5, 0.9, { type: 'sine', vol: 0.3 });
    },
    cheer() {
      if (!ok()) return;
      const t = ac.currentTime;
      noise(t, 1.6, { filter: 'bandpass', freq: 1400, q: 0.5, vol: 0.16, attack: 0.3 });
      noise(t + 0.1, 1.4, { filter: 'bandpass', freq: 2600, q: 0.8, vol: 0.08, attack: 0.25 });
      for (let i = 0; i < 6; i++) noise(t + 0.2 + i * 0.12, 0.05, { filter: 'bandpass', freq: 2000 + Math.random() * 1500, vol: 0.15 });
    },
  };
})();
