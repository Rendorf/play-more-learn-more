// Moving to the game's own address (src/move.js). Browsers keep saved progress per address, so here
// http://127.0.0.1:8766 plays the old address (rendorf.github.io) and http://localhost:8766 plays play.pmlm.uk:
// two addresses with separate storage, like the real move. ?moveto= is the local test switch.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { newPlayer, playRound, home, act, STORE, watchErrors } from './helpers.mjs';

const fx = JSON.parse(readFileSync(new URL('../fixtures/live-e9a72c3.json', import.meta.url), 'utf8'));
const NEW = 'http://localhost:8766/index.html';
const OLD = (to = NEW) => `http://127.0.0.1:8766/index.html?moveto=${encodeURIComponent(to)}`;
const read = (page, k = STORE) => page.evaluate(key => JSON.parse(localStorage.getItem(key)), k);
const strip = s => { const c = JSON.parse(JSON.stringify(s)); delete c.movedFrom; delete c.updatedAt; c.profiles.forEach(p => { delete p.quests; delete p.updatedAt; }); return c; };

// Old address with saved progress (and anything else in its storage)
async function oldDevice(context, extra = {}) {
  await context.addInitScript(([k, v, more]) => {
    if (location.hostname === '127.0.0.1' && !localStorage.getItem('__seeded')) {
      localStorage.setItem(k, v);
      for (const [mk, mv] of Object.entries(more)) localStorage.setItem(mk, mv);
      localStorage.setItem('__seeded', '1');
    }
  }, [STORE, fx.state, extra]);
}

test('a device moves with all its progress, and an old bookmark changes nothing', async ({ context, page }) => {
  const errors = watchErrors(page);
  await oldDevice(context);
  await page.goto(OLD());
  await page.waitForURL(NEW);   // arrived, and the #move= part is gone from the address
  await expect(page.locator('.sheet')).toContainText('Welcome to play.pmlm.uk');
  await expect(page.locator('.sheet')).toContainText('everyone’s progress came along');
  await page.waitForTimeout(500);
  const moved = await read(page);
  expect(strip(moved)).toEqual(strip(JSON.parse(fx.state)));
  // the old address still has its copy, untouched, as a safety net
  const oldTab = await context.newPage();
  await oldTab.goto('http://127.0.0.1:8766/move.json');
  expect(await read(oldTab)).toEqual(JSON.parse(fx.state));
  // play on the new address, then open the old bookmark again
  await page.locator('.sheet [data-act="close"]').first().click();
  await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page);
  await page.waitForTimeout(500);
  const played = await read(page);
  await page.goto(OLD());
  await page.waitForURL(NEW);
  await page.waitForTimeout(800);
  expect(await page.locator('.sheet').count()).toBe(0);   // nothing new came along
  expect(strip(await read(page))).toEqual(strip(played));
  expect(errors).toEqual([]);
});

test('moved players join the players already on the new address', async ({ context, page }) => {
  await page.goto(NEW);
  await newPlayer(page, { name: 'Already Here', grade: 2 });
  await oldDevice(context);
  await page.goto(OLD());
  await page.waitForURL(NEW);
  await page.waitForTimeout(500);
  const names = (await read(page)).profiles.map(p => p.name).sort();
  expect(names).toEqual(['Already Here', ...JSON.parse(fx.state).profiles.map(p => p.name)].sort());
});

test('a device with no players just goes to the new address', async ({ page }) => {
  await page.goto(OLD());
  await page.waitForURL(NEW);
  await page.waitForTimeout(500);
  expect(await page.locator('.sheet').count()).toBe(0);   // nothing came along, so no welcome sheet
});

test('a player removed on the new address does not come back with a later move', async ({ context, page }) => {
  await oldDevice(context);
  await page.goto(OLD());
  await page.waitForURL(NEW);
  await page.waitForTimeout(500);
  const gone = JSON.parse(fx.state).profiles[0].id;
  await page.evaluate(([k, id]) => { const s = JSON.parse(localStorage.getItem(k)); s.profiles = s.profiles.filter(p => p.id !== id); s.deleted = Object.assign(s.deleted || {}, { [id]: Date.now() }); s.movedFrom = []; localStorage.setItem(k, JSON.stringify(s)); }, [STORE, gone]);
  await page.goto(OLD());
  await page.waitForURL(NEW);
  await page.waitForTimeout(500);
  expect((await read(page)).profiles.map(p => p.id)).not.toContain(gone);
});

test('when the new address is not ready, the device stays and plays as usual', async ({ context, page }) => {
  await oldDevice(context);
  await page.goto(OLD('http://localhost:9/index.html'));
  await expect(page.locator('#tabs')).toBeVisible();
  expect(page.url()).toContain('127.0.0.1:8766');
  expect((await read(page)).profiles.length).toBe(JSON.parse(fx.state).profiles.length);
});

test('a device that was linked to a family is told to link again', async ({ context, page }) => {
  await oldDevice(context, { 'pmlm.sync': '1' });
  await page.goto(OLD());
  await page.waitForURL(NEW);
  await expect(page.locator('.sheet')).toContainText('linked to a family account');
  // the family-saving status says to link it again, instead of quietly showing "Not connected"
  expect(await page.evaluate(() => localStorage.getItem('pmlm.sync'))).toBe('1');
});

test('a Home Screen app moves with a code pasted on the welcome screen', async ({ page }) => {
  await page.goto(NEW);
  await page.evaluate(() => localStorage.clear()); await page.reload();
  await act(page, 'moveopen');
  await page.fill('#movecode', fx.backup);
  await act(page, 'movego');
  await act(page, 'importadd');
  await page.waitForTimeout(500);
  expect((await read(page)).profiles.map(p => p.id)).toEqual(JSON.parse(fx.backup).profiles.map(p => p.id));
});
