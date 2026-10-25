// Family accounts across versions, with the mock Firebase backend (tools/mock-firebase.js): no real accounts.
// While families update their devices at different times, one child plays on a device still on the live version
// and on another already on the new version. Nothing may be lost in either direction, and the new online extras
// must not disturb the family login.
import { test, expect } from '@playwright/test';
import { oldBuild, newPlayer, openParents, playRound, home, act, tab, state, clearEmulators, waitForDocs, watchErrors, keptOrGrew } from './helpers.mjs';

const NEW = '/build/synctest.html';
const snap = page => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]))));
async function become(page, saved, url) {
  await page.evaluate(s => { localStorage.clear(); for (const [k, v] of Object.entries(JSON.parse(s))) localStorage.setItem(k, v); }, saved);
  await page.goto(url);
  await page.locator('#view button').first().waitFor();
  await page.waitForTimeout(1500);   // family data arrives
}
const serverPlayer = (page, name) => page.evaluate(n => {
  const docs = window.__mock.server.docs;
  for (const [path, d] of Object.entries(docs)) if (/\/players\//.test(path)) { const p = JSON.parse(d.data); if (p.name === n) return p; }
  return null;
}, name);
async function practiseRound(page) { await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page); await page.waitForTimeout(2500); }

test('a child playing on a live-version device and a new-version device keeps everything', async ({ page }) => {
  const old = oldBuild();
  const errors = watchErrors(page);
  await clearEmulators();
  // Parent's phone, new version: a child, a round, a family account and a link code
  await page.goto(NEW + '?emu=1'); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await page.reload();
  await newPlayer(page, { name: 'Kid A', grade: 3 });
  await practiseRound(page);
  await openParents(page);
  await act(page, 'loginopen');
  await page.fill('#pl-email', 'parent@example.com'); await page.fill('#pl-pass', 'secret123');
  await act(page, 'signupemail');
  await expect(page.getByText('Devices and parents')).toBeVisible();
  await act(page, 'mkcode', '[data-r="device"]');
  const code = (await page.locator('.codebox').innerText()).trim();
  await page.waitForTimeout(2000);
  const fromNew = await serverPlayer(page, 'Kid A');
  expect(fromNew.week && fromNew.week.q).toBeGreaterThanOrEqual(10);
  const parentPhone = await snap(page);

  // Child's tablet, live version: link to the family, play a round
  await page.evaluate(() => localStorage.clear());
  await page.goto(old.synctest);
  await act(page, 'linkopen');
  await page.fill('#lk-code', code); await page.fill('#lk-name', 'Tablet');
  await act(page, 'linkgo');
  await page.locator('#tabs:visible, [data-act="pick"]').first().waitFor();
  if (await page.locator('[data-act="pick"]').count()) await page.locator('[data-act="pick"]').first().click();
  await practiseRound(page);
  const fromOld = await serverPlayer(page, 'Kid A');
  expect(fromOld.stats.rounds).toBe(2);
  keptOrGrew(expect, fromNew.week, fromOld.week, 'week');        // the live version keeps (or adds to) the new fields
  expect(fromOld.stats.active).toBeGreaterThanOrEqual(fromNew.stats.active);
  const tablet = await snap(page);

  // Back on the parent's phone (new version): the tablet's round is there, and playing adds to it
  await become(page, parentPhone, NEW + '?emu=1');
  let s = await state(page);
  expect(s.profiles.find(p => p.name === 'Kid A').stats.rounds).toBe(2);
  await tab(page, 'play');
  await practiseRound(page);
  const latest = await serverPlayer(page, 'Kid A');
  expect(latest.stats.rounds).toBe(3);
  expect(latest.week.q).toBeGreaterThan(fromNew.week.q);

  // The new extras don't disturb the family login: leaderboard and its settings while signed in as a parent
  await tab(page, 'top');
  await expect(page.locator('.lbrow.me')).toBeVisible();
  await tab(page, 'parent');
  const kid = (await state(page)).profiles.find(p => p.name === 'Kid A');
  await page.selectOption(`select[data-change="pboard"][data-id="${kid.id}"]`, 'name');
  await expect(page.getByText('Devices and parents')).toBeVisible();
  await expect(page.locator('#syncstatus')).toContainText('All changes saved online');
  await waitForDocs('leaderboard', d => d.pid === kid.id && d.nick === 'Kid A');

  // And the tablet (live version) gets all of it
  await become(page, tablet, old.synctest);
  s = await state(page);
  const onTablet = s.profiles.find(p => p.name === 'Kid A');
  expect(onTablet.stats.rounds).toBe(3);
  expect(onTablet.board).toBe('name');
  expect(errors.filter(e => !/Failed to fetch/.test(e))).toEqual([]);
});
