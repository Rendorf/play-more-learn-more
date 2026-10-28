// Google Analytics (src/analytics.js). ?gatest=1 runs it on the test server, and Google's script is replaced by an
// empty one, so nothing reaches Google: the tests read what the game and the landing page put in window.dataLayer.
import { test, expect } from '@playwright/test';
import { act, newPlayer, openParents, playRound, home, tab, state } from './helpers.mjs';

const calls = page => page.evaluate(() => (window.dataLayer || []).map(a => JSON.parse(JSON.stringify(Array.from(a)))));
const events = async page => (await calls(page)).filter(c => c[0] === 'event').map(c => [c[1], c[2]]);
const choice = async page => ((await page.context().cookies()).find(c => c.name === 'pmlm_analytics') || {}).value;

test.beforeEach(async ({ page }) => {
  await page.route('**/www.googletagmanager.com/**', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
});

test('the game: cookieless until a grown-up allows it, screens and rounds with no names or ids', async ({ page }) => {
  await page.goto('/index.html?emu=1&gatest=1'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await newPlayer(page, { name: 'Secret Name', grade: 3 });
  await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page);

  const c = await calls(page);
  expect(c[0]).toEqual(['consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
  expect(c.find(x => x[0] === 'config')[2]).toMatchObject({ allow_google_signals: false, allow_ad_personalization_signals: false, send_page_view: false, site_part: 'game' });
  const ev = await events(page);
  expect(ev.filter(e => e[0] === 'page_view').map(e => e[1].page_title)).toEqual(expect.arrayContaining(['welcome', 'play', 'round']));
  expect(ev.find(e => e[0] === 'player_added')[1]).toEqual({ grade: 3 });
  expect(ev.find(e => e[0] === 'round_done')[1]).toMatchObject({ grade: 3, mode: expect.any(String), answered: expect.any(Number), seconds: expect.any(Number) });
  const me = (await state(page)).profiles[0];
  expect(JSON.stringify(c)).not.toContain('Secret Name');
  expect(JSON.stringify(c)).not.toContain(me.id);
  expect(await choice(page)).toBeUndefined();

  // A grown-up allows cookies in Parents → Settings; the next visit starts with them allowed
  await openParents(page);
  await page.locator('input[data-change="gaconsent"]').check();
  expect((await calls(page)).pop()).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
  expect(await choice(page)).toBe('granted');
  await page.reload(); await page.locator('#tabs').waitFor();
  expect((await calls(page))[0][2].analytics_storage).toBe('granted');

  // Switching play stats off stops Analytics too
  await openParents(page);
  await page.locator('input[data-k="stats"]').uncheck();
  const before = (await events(page)).length;
  await tab(page, 'me'); await tab(page, 'play');
  expect((await events(page)).length).toBe(before);
});

test('the landing page: grown-ups are asked once, Play taps and sections are counted', async ({ page }) => {
  await page.goto('/welcome.html?gatest=1');
  await expect(page.locator('#consent')).toBeVisible();
  const c = await calls(page);
  expect(c[0][2].analytics_storage).toBe('denied');
  expect(c.find(x => x[0] === 'config')[2]).toMatchObject({ allow_google_signals: false, send_page_view: true, site_part: 'landing' });

  await page.locator('#ga-no').click();
  await expect(page.locator('#consent')).toBeHidden();
  expect(await choice(page)).toBe('denied');
  await page.reload();
  await expect(page.locator('#consent')).toBeHidden();

  // Cookie settings in the footer asks again; Allow is remembered
  await page.locator('footer [data-cookies]').click();
  await expect(page.locator('#consent')).toBeVisible();
  await page.locator('#ga-yes').click();
  expect((await calls(page)).pop()).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
  expect(await choice(page)).toBe('granted');

  await page.locator('[data-part="grownups"]').first().click();
  expect((await events(page)).find(e => e[0] === 'section_view')[1]).toEqual({ section: 'grownups' });
  // The privacy answer opens from the footer
  await page.locator('footer [data-privacy]').click();
  await expect(page.locator('#privacy')).toHaveAttribute('open', '');
  await expect(page.locator('#privacy')).toContainText('Google Analytics');

  // A Play tap is counted (the test keeps the page here instead of opening the real game)
  await page.evaluate(() => document.querySelectorAll('[data-play]').forEach(a => a.addEventListener('click', e => e.preventDefault())));
  await page.locator('[data-play]:visible').first().click();
  expect((await events(page)).find(e => e[0] === 'play_click')[1]).toEqual({ place: expect.any(String) });
});

test('anywhere but pmlm.uk (and without ?gatest=1) nothing loads and nothing is asked', async ({ page }) => {
  let asked = 0;
  await page.route('**/www.googletagmanager.com/**', r => { asked++; return r.abort(); });
  await page.goto('/welcome.html');
  await expect(page.locator('#consent')).toBeHidden();
  await expect(page.locator('#cookielink')).toBeHidden();
  await page.goto('/index.html'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await newPlayer(page, { name: 'Kid A', grade: 2 });
  expect(await page.evaluate(() => window.dataLayer)).toBeUndefined();
  expect(asked).toBe(0);
});
