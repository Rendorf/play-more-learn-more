// Background music (src/music.js): when it plays, who picks it, the volume and off switches, and a sound check.
// #debug exposes the round (window.__pmlm) so the test can answer correctly and build a combo.
import { test, expect } from '@playwright/test';
import { newPlayer, openParents, tab, act, home, state } from './helpers.mjs';

const PAGE = '/index.html#debug';
const music = page => page.evaluate(() => Music.state());
async function fresh(page) { await page.goto(PAGE); await page.evaluate(() => localStorage.clear()); await page.reload(); }
// Answer the current question correctly with the keyboard (number and multiple-choice questions)
async function answerRight(page) {
  await page.evaluate(async () => {
    const R = window.__pmlm.R, q = R.q, key = k => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    if (q.kind === 'number') { String(q.answer).split('').forEach(key); key('Enter'); } else if (q.kind === 'choice') key(String(R.choices.indexOf(q.answer) + 1));
    await new Promise(r => setTimeout(r, 300));
    key('Enter');
    await new Promise(r => setTimeout(r, 300));
  });
}

test('music starts on the first tap, follows the world and keeps playing across screens', async ({ page }) => {
  await fresh(page);
  expect((await music(page)).playing).toBe(false);
  await page.locator('[data-act="newplayer"]').first().click();
  await expect.poll(async () => (await music(page)).playing).toBe(true);
  expect((await music(page)).song).toBe('theme.space');
  await page.locator('[data-act="np"][data-k="theme"][data-v="ocean"]').click();
  await expect.poll(async () => (await music(page)).song).toBe('theme.ocean');
  await page.fill('#np-name', 'Ana');
  await page.locator('[data-act="np"][data-k="grade"][data-v="2"]').click();
  await page.locator('[data-act="createplayer"]').click();
  await page.waitForTimeout(1700);
  if (await page.locator('.sheet [data-act="close"]').count()) await page.locator('.sheet [data-act="close"]').last().click();
  const plays = (await music(page)).plays;
  for (const t of ['me', 'wishes', 'parent', 'play']) await tab(page, t);
  expect(await music(page)).toMatchObject({ song: 'theme.ocean', plays, playing: true, scene: 'menu' });

  // A round: same song, and the combo builds it up
  await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise');
  expect(await music(page)).toMatchObject({ scene: 'round', song: 'theme.ocean', plays });
  for (let i = 0; i < 4; i++) await answerRight(page);
  expect((await music(page)).energy).toBeGreaterThanOrEqual(1);
  await act(page, 'quit'); await act(page, 'leave');
  expect(await music(page)).toMatchObject({ scene: 'menu', energy: 0, plays, playing: true });
});

test('each child picks their own music, and it is saved with that child', async ({ page }) => {
  await fresh(page);
  await newPlayer(page, { name: 'Ana', grade: 3 });
  await tab(page, 'me');
  await act(page, 'musicstyle', '[data-v="party"]');
  await expect(page.locator('#musiccard')).toContainText('Party · Space');
  expect((await music(page)).song).toBe('party.space');
  await act(page, 'players');
  await newPlayer(page, { name: 'Ben', grade: 2 });
  expect((await music(page)).song).toBe('theme.space');
  let s = await state(page);
  expect(s.profiles.find(p => p.name === 'Ana').music).toBe('party');
  expect(s.profiles.find(p => p.name === 'Ben').music).toBeUndefined();
  await act(page, 'players'); await page.locator('.sheet [data-act="pick"]', { hasText: 'Ana' }).click();
  await expect.poll(async () => (await music(page)).song).toBe('party.space');
  // A different world plays the same mood with that world's instruments
  await tab(page, 'me');
  await act(page, 'theme', '[data-id="jungle"]');
  await expect.poll(async () => (await music(page)).song).toBe('party.jungle');
});

test('volume, the grown-ups\' switch, the mute button and a hidden page', async ({ page }) => {
  await fresh(page);
  await newPlayer(page, { name: 'Cem', grade: 4 });
  await tab(page, 'me');
  await page.locator('#musiccard input.vol').fill('20');
  await expect.poll(async () => (await music(page)).volume).toBe(20);
  expect((await state(page)).settings.musicVol).toBe(20);
  await page.reload();
  await page.locator('#tabs').click();   // a tap starts the music again after a reload
  expect((await music(page)).volume).toBe(20);

  // Grown-ups switch it off
  await openParents(page);
  await page.locator('input[data-k="music"]').uncheck();
  await expect.poll(async () => (await music(page)).playing).toBe(false);
  await tab(page, 'me');
  await expect(page.locator('#musiccard')).toContainText('Music is switched off');
  await openParents(page);
  await page.locator('input[data-k="music"]').check();
  await expect.poll(async () => (await music(page)).playing).toBe(true);

  // The mute button silences everything, and brings it back
  await act(page, 'mute');
  await expect.poll(async () => (await music(page)).playing).toBe(false);
  await act(page, 'mute');
  await expect.poll(async () => (await music(page)).playing).toBe(true);

  // A hidden page pauses the music; it comes back when the page is shown
  const hide = h => page.evaluate(v => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => v }); document.dispatchEvent(new Event('visibilitychange')); }, h);
  await hide(true);
  expect(await music(page)).toMatchObject({ playing: false, paused: true });
  await hide(false);
  expect(await music(page)).toMatchObject({ playing: true, paused: false });
});

test('sound check: every style in every world is clean and evenly loud', async ({ page }) => {
  await page.goto(PAGE);
  const levels = await page.evaluate(async () => {
    const out = [];
    for (const s of Music.STYLES) for (const w of Object.keys(Music.WORLDS)) out.push(Object.assign({ id: `${s.id}.${w}` }, await Music.render(s.id, w, 6, 2)));
    return out;
  });
  expect(levels).toHaveLength(20);
  const db = x => 20 * Math.log10(x);
  for (const l of levels) {
    expect(l.peak, `${l.id} clips`).toBeLessThan(0.99);
    expect(db(l.rms), `${l.id} is too quiet`).toBeGreaterThan(-36);
  }
  const loud = levels.map(l => db(l.rms));
  expect(Math.max(...loud) - Math.min(...loud), 'songs differ too much in loudness').toBeLessThan(6);
});
