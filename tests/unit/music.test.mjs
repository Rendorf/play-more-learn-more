import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

// The composer is pure: song data and each bar's notes, no sound needed
const { Music } = load(['music.js'], {}, ['Music']);
const STYLES = Music.STYLES.map(s => s.id), WORLDS = Object.keys(Music.WORLDS);
const DRUMS = ['kick', 'snare', 'clap', 'hat', 'ohat', 'shaker', 'tomL', 'tomH', 'bongoH', 'bongoL', 'log', 'crash'];
const each = fn => { for (const s of STYLES) for (const w of WORLDS) fn(s, w, Music.compose(s, w)); };

test('every style is arranged for every world, each with its own title', () => {
  assert.equal(STYLES.join(), 'theme,lofi,calm,adventure,party');
  each((s, w, song) => {
    assert.equal(song.id, `${s}.${w}`);
    assert.ok(song.bpm >= 60 && song.bpm <= 130, `${song.id} tempo`);
    assert.ok(song.title);
  });
  assert.equal(Music.compose('theme', 'ocean').title, 'Island Hop');
  assert.equal(Music.compose('lofi', 'candy').title, 'Lofi cozy · Candy');
  assert.equal(Music.compose('lofi', 'jungle').lead, 'marimba', 'a mood keeps the world\'s instrument');
  assert.equal(Music.compose('nope', 'mars').id, 'theme.space', 'unknown names fall back to the default');
});

test('every bar of every song has playable notes, at every energy', () => {
  each((s, w, song) => {
    for (const e of [0, 2, 4]) for (let n = 0; n < 64; n++) for (const ev of Music.bar(song, n, e, e === 4)) {
      assert.ok(ev.at >= 0 && ev.at < 16, `${song.id} bar ${n}: time ${ev.at}`);
      assert.ok(ev.len > 0 && ev.len <= 32, `${song.id} bar ${n}: length ${ev.len}`);
      assert.ok(Number.isFinite(ev.g) && ev.g > 0 && ev.g <= 1.5, `${song.id} bar ${n}: gain ${ev.g}`);
      if (ev.n != null) assert.ok(Number.isInteger(ev.n) && ev.n >= 24 && ev.n <= 108, `${song.id} bar ${n}: note ${ev.n}`);
    }
  });
});

test('the same song and bar always give the same notes', () => {
  assert.equal(JSON.stringify(Music.bar(Music.compose('party', 'jungle'), 5, 2)), JSON.stringify(Music.bar(Music.compose('party', 'jungle'), 5, 2)));
});

test('catchy: every song starts with a tune and its hook comes back', () => {
  each((s, w, song) => {
    const tune = n => JSON.stringify(Music.bar(song, n).filter(e => e.v === song.lead).map(e => [e.at, e.n]));
    assert.notEqual(tune(0), '[]', `${song.id}: the first bar has a tune`);
    assert.equal(tune(0), tune(8), `${song.id}: the second A section repeats the hook`);
    assert.equal(tune(0), tune(32), `${song.id}: the song loops`);
  });
});

test('the combo only adds layers: the tune always stays', () => {
  each((s, w, song) => {
    for (let n = 0; n < 32; n++) {
      const lead = e => Music.bar(song, n, e).filter(x => x.v === song.lead && x.g === 1).length;
      assert.equal(lead(4), lead(0), `${song.id} bar ${n}`);
      assert.ok(Music.bar(song, n, 4).length >= Music.bar(song, n, 0).length, `${song.id} bar ${n}`);
    }
  });
});

test('calm never has drums, lofi swings, a boss battle adds drums', () => {
  for (const w of WORLDS) {
    const calm = Music.compose('calm', w);
    for (let n = 0; n < 32; n++) assert.equal(Music.bar(calm, n, 4, true).filter(e => DRUMS.includes(e.v)).length, 0, `calm ${w} bar ${n}`);
    assert.ok(Music.bar(Music.compose('lofi', w), 0).some(e => e.at % 1 !== 0), `lofi ${w}: offbeats come late`);
    assert.ok(Music.bar(Music.compose('theme', w), 0).every(e => e.at % 1 === 0), `the ${w} song is straight`);
  }
  const song = Music.compose('theme', 'space'), drums = boss => Music.bar(song, 3, 0, boss).filter(e => DRUMS.includes(e.v)).length;
  assert.ok(drums(true) > drums(false));
});
