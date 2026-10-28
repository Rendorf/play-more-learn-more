// The landing page at pmlm.uk (welcome.html, src/landing.js). Browsers keep saved progress per address, so here
// http://127.0.0.1:8766 plays pmlm.uk (a device may have played the game there) and http://localhost:8766 plays
// play.pmlm.uk, the game's own address. ?moveto= is the local test switch, as in move.spec.mjs.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { act, STORE, watchErrors } from './helpers.mjs';

const fx = JSON.parse(readFileSync(new URL('../fixtures/live-e9a72c3.json', import.meta.url), 'utf8'));
const NEW = 'http://localhost:8766/index.html';
const LANDING = (to = NEW, more = '') => `http://127.0.0.1:8766/welcome.html?moveto=${encodeURIComponent(to)}${more}`;
const read = (page, k = STORE) => page.evaluate(key => JSON.parse(localStorage.getItem(key)), k);
const strip = s => { const c = JSON.parse(JSON.stringify(s)); delete c.movedFrom; delete c.updatedAt; c.profiles.forEach(p => { delete p.quests; delete p.updatedAt; }); return c; };

// pmlm.uk with saved progress from the days it served the game (and anything else in its storage)
async function playedHere(context, extra = {}) {
  await context.addInitScript(([k, v, more]) => {
    if (location.hostname === '127.0.0.1' && !localStorage.getItem('__seeded')) {
      localStorage.setItem(k, v);
      for (const [mk, mv] of Object.entries(more)) localStorage.setItem(mk, mv);
      localStorage.setItem('__seeded', '1');
    }
  }, [STORE, fx.state, extra]);
}

test('a new visitor sees the page, both halves work, and every picture loads', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(LANDING());
  await expect(page.locator('meta[name="pmlm-page"]')).toHaveAttribute('content', 'landing');
  await expect(page.locator('#kids')).toBeVisible();
  await expect(page.locator('#grownups')).toBeHidden();
  await page.locator('[data-part="grownups"]').click();
  await expect(page.locator('#grownups')).toBeVisible();
  await expect(page.locator('#kids')).toBeHidden();
  expect(page.url()).toContain('#grownups');
  await expect(page.locator('[data-play]').first()).toHaveAttribute('href', 'https://play.pmlm.uk/');
  // every picture is there and is a real image
  const srcs = await page.locator('img').evaluateAll(imgs => imgs.map(i => i.getAttribute('src')));
  for (const src of srcs) {
    const r = await page.request.get(new URL(src, page.url()).href);
    expect(r.status(), src).toBe(200);
    expect(r.headers()['content-type'], src).toMatch(/^image\//);
  }
  // nothing was saved: a visitor who only reads the page leaves no trace
  expect(await page.evaluate(() => Object.keys(localStorage).filter(k => /^pmlm/.test(k)))).toEqual([]);
  // #grownups opens that half straight away (a link a grown-up can send)
  await page.goto(LANDING() + '#grownups');
  await expect(page.locator('#grownups')).toBeVisible();
  expect(errors).toEqual([]);
});

test('a device that played on pmlm.uk moves to the game with all its progress, once', async ({ context, page }) => {
  const errors = watchErrors(page);
  await playedHere(context);
  await page.goto(LANDING());
  await page.waitForURL(NEW);
  await expect(page.locator('.sheet')).toContainText('Welcome to play.pmlm.uk');
  await page.waitForTimeout(500);
  expect(strip(await read(page))).toEqual(strip(JSON.parse(fx.state)));
  // pmlm.uk keeps its copy as a safety net, and remembers the move
  const back = await context.newPage();
  await back.goto(LANDING());
  await expect(back.locator('#kids')).toBeVisible();   // the same progress isn't sent again: the page shows
  expect(await read(back)).toEqual(JSON.parse(fx.state));
  expect(await read(back, 'pmlm.moved')).toMatchObject({ key: expect.any(String) });
  expect(errors).toEqual([]);
});

test('a device in a family is told to link again, and its old reminders are switched off', async ({ context, page }) => {
  await playedHere(context, { 'pmlm.sync': '1', 'pmlm.push': JSON.stringify({ on: true, hour: 18 }) });
  await page.goto(LANDING());
  await page.waitForURL(NEW);
  await expect(page.locator('.sheet')).toContainText('linked to a family account');
  await expect(page.locator('.sheet')).toContainText('daily reminder');
  expect(await page.evaluate(() => localStorage.getItem('pmlm.sync'))).toBe('1');
  const back = await context.newPage();
  await back.goto(LANDING());
  expect((await read(back, 'pmlm.push')).on).toBe(false);
});

test('a friend\'s invite link goes straight to the game', async ({ page }) => {
  await page.goto(LANDING(NEW, '&invite=ABC234'));
  await page.waitForURL(NEW);
});

test('progress packed by an old GitHub tab passes straight through', async ({ page }) => {
  await page.goto(NEW);
  const code = await page.evaluate(s => Move.encode({ v: 1, state: JSON.parse(s), family: false, push: null }), fx.state);
  await page.evaluate(() => localStorage.clear());
  await page.goto(LANDING() + '#move=' + code);
  await page.waitForURL(NEW);
  await expect(page.locator('.sheet')).toContainText('Welcome to play.pmlm.uk');
  await page.waitForTimeout(500);
  expect(strip(await read(page))).toEqual(strip(JSON.parse(fx.state)));
});

test('when the game\'s address doesn\'t answer, the progress stays put and the page says so', async ({ context, page }) => {
  await playedHere(context);
  await page.goto(LANDING('http://localhost:9/index.html'));
  await expect(page.locator('#stuck')).toBeVisible();
  await expect(page.locator('#stuck')).toContainText('Your progress is safe on this device');
  expect(page.url()).toContain('127.0.0.1:8766');
  expect(await read(page)).toEqual(JSON.parse(fx.state));
  expect(await read(page, 'pmlm.moved')).toBeNull();
});

test('an iPhone Home Screen app copies a progress code that the new icon takes', async ({ context, page, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are a Chromium feature');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await context.addInitScript(() => { if (location.hostname === '127.0.0.1') Object.defineProperty(navigator, 'standalone', { value: true }); });
  await playedHere(context);
  await page.goto(LANDING());
  await expect(page.locator('#codepanel')).toBeVisible();
  expect(page.url()).toContain('127.0.0.1:8766');   // never moves by itself
  await page.locator('#copycode').click();
  await expect(page.locator('#copied')).toBeVisible();
  const code = await page.evaluate(() => navigator.clipboard.readText());
  expect(code).toBe(fx.state);
  // the new icon: paste it under "Moving from the old app?"
  const fresh = await context.newPage();
  await fresh.goto(NEW);
  await act(fresh, 'moveopen');
  await fresh.fill('#movecode', code);
  await act(fresh, 'movego');
  await act(fresh, 'importadd');
  await fresh.waitForTimeout(500);
  expect((await read(fresh)).profiles.map(p => p.id)).toEqual(JSON.parse(fx.state).profiles.map(p => p.id));
  // "Read how the game works" still shows the page
  await page.locator('#readpage').click();
  await expect(page.locator('#kids')).toBeVisible();
});
