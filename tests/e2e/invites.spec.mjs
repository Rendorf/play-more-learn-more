// Invite a friend, end to end against the local Firebase emulators (?emu=1) with the real firestore.rules.
// Each device is its own browser context (its own storage and anonymous account).
import { test, expect } from '@playwright/test';
import { clearEmulators, docs, putDoc, newPlayer, openParents, playRound, home, act, tab, state, watchErrors } from './helpers.mjs';

const EMU = '/index.html?emu=1';
async function fresh(page) { await page.goto(EMU); await page.evaluate(() => localStorage.clear()); await page.reload(); }
async function practiseRound(page) { await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page); }
const inviteCode = page => page.evaluate(() => (JSON.parse(localStorage.getItem('pmlm.inv')) || {})[JSON.parse(localStorage.getItem('pmlm.v1')).current]);
// The inviting child: a player, then Me → Copy link (makes the code on the server)
async function inviter(page, name = 'Ana') {
  await fresh(page);
  await newPlayer(page, { name, grade: 3 });
  await tab(page, 'me');
  await act(page, 'invcopy');
  await expect.poll(() => inviteCode(page)).toMatch(/^[A-Z0-9]{6}$/);
  if (await page.locator('.sheet [data-act="close"]').count()) await page.locator('.sheet [data-act="close"]').last().click();
  return inviteCode(page);
}
async function device(browser) { const ctx = await browser.newContext(); return { ctx, page: await ctx.newPage() }; }
const friendsOf = async code => (await docs(`invites/${code}/friends`));

test.beforeEach(async () => { await clearEmulators(); });

test('a friend joins through the link: welcome gift for them, 100 coins once for the inviter', async ({ page, browser }) => {
  const errors = watchErrors(page);
  const code = await inviter(page);
  expect((await docs('invites')).find(d => d._id === code)).toMatchObject({ pid: (await state(page)).current });
  await expect(page.locator('#invitecard')).toContainText('No friends yet');

  // The friend's brand-new device opens the link
  const f = await device(browser);
  await f.page.goto(`${EMU}&invite=${code}`);
  await expect(f.page.locator('.invitebanner')).toContainText('A friend invited you');
  expect(f.page.url()).not.toContain('invite=');
  await expect.poll(async () => (await friendsOf(code)).length).toBe(1);
  await newPlayer(f.page, { name: 'Leyla', grade: 2 });
  await expect.poll(async () => (await friendsOf(code))[0]).toMatchObject({ name: 'Leyla' });
  const before = (await state(f.page)).profiles[0].coins;
  await practiseRound(f.page);
  const friendAfter = await state(f.page);
  expect(friendAfter.profiles[0].coins).toBeGreaterThanOrEqual(before + 50);
  expect(await f.page.evaluate(() => JSON.parse(localStorage.getItem('pmlm.ref')).gift)).toBe(true);
  await expect.poll(async () => (await friendsOf(code))[0].played).toBeGreaterThan(0);

  // The inviter comes back: paid once, with a celebration
  const coins0 = (await state(page)).profiles[0].coins;
  await page.reload();
  await expect(page.locator('.celebrate')).toContainText('Leyla joined and played!', { timeout: 15000 });
  await page.locator('.celebrate button').click();
  let s = await state(page);
  expect(s.profiles[0].coins).toBe(coins0 + 100);
  expect(Object.keys(s.profiles[0].inviteRewards)).toHaveLength(1);
  expect(s.profiles[0].trophies.friend1).toBeTruthy();
  await expect.poll(async () => (await friendsOf(code))[0].rewarded).toBeGreaterThan(0);
  await tab(page, 'me');
  await expect(page.locator('.invrow')).toContainText('Leyla');
  await expect(page.locator('.invrow')).toContainText('+100 🪙');

  // Coming back again pays nothing more
  await page.reload();
  await page.waitForTimeout(5500);
  s = await state(page);
  expect(s.profiles[0].coins).toBe(coins0 + 100);
  // Parents see it in the family card
  await openParents(page);
  await expect(page.locator('.famcard').first()).toContainText('💌 1 invited · 1 played · +100 🪙');

  // Tracked in the anonymous stats, with no names
  const ev = (await docs('events')).filter(e => e.type === 'invite').map(e => e.mode);
  expect(ev).toEqual(expect.arrayContaining(['share', 'open', 'join', 'play', 'reward']));
  const all = JSON.stringify(await docs('events'));
  expect(all).not.toContain('Leyla');
  expect(all).not.toContain('Ana');
  expect(errors).toEqual([]);
  await f.ctx.close();
});

test('not counted: the inviter\'s own account, a second invite, or a device that already plays', async ({ page, browser }) => {
  const code = await inviter(page);
  const code2 = await (async () => { const o = await device(browser); const c = await inviter(o.page, 'Ben'); await o.ctx.close(); return c; })();

  // A device that already has players
  await page.goto(`${EMU}&invite=${code2}`);
  await expect(page.locator('.toast')).toContainText('This device already plays');
  expect(await friendsOf(code2)).toHaveLength(0);

  // The inviter's own account on a fresh browser (same anonymous account, no players): refused by the rules
  const anon = await page.evaluate(() => localStorage.getItem('pmlm.anon'));
  const own = await device(browser);
  await own.page.goto(EMU);
  await own.page.evaluate(a => { localStorage.clear(); localStorage.setItem('pmlm.anon', a); }, anon);
  await own.page.goto(`${EMU}&invite=${code}`);
  await expect.poll(() => own.page.evaluate(() => (JSON.parse(localStorage.getItem('pmlm.ref')) || {}).dead)).toBe(true);
  expect(await friendsOf(code)).toHaveLength(0);
  await own.ctx.close();

  // A new device that already came through one invite does not take a second
  const f = await device(browser);
  await f.page.goto(`${EMU}&invite=${code}`);
  await expect.poll(async () => (await friendsOf(code)).length).toBe(1);
  await f.page.goto(`${EMU}&invite=${code2}`);
  await f.page.waitForTimeout(2500);
  expect(await friendsOf(code2)).toHaveLength(0);
  expect(await f.page.evaluate(() => JSON.parse(localStorage.getItem('pmlm.ref')).code)).toBe(code);
  await f.ctx.close();
});

test('coins for up to 10 friends; the rest still show, marked "limit reached"', async ({ page }) => {
  const code = await inviter(page);
  for (let i = 1; i <= 11; i++) await putDoc(`invites/${code}/friends/f${i}`, { t: i, name: `Friend ${i}`, joined: 100 + i, played: 200 + i });
  const coins0 = (await state(page)).profiles[0].coins;
  await page.reload();
  await expect(page.locator('.celebrate')).toBeVisible({ timeout: 15000 });
  for (let i = 0; i < 12 && (await page.locator('.celebrate button').count()); i++) { await page.locator('.celebrate button').first().click(); await page.waitForTimeout(150); }
  const s = await state(page);
  expect(Object.keys(s.profiles[0].inviteRewards)).toHaveLength(10);
  expect(s.profiles[0].coins).toBe(coins0 + 1000);
  expect(s.profiles[0].trophies.friend5).toBeTruthy();
  await tab(page, 'me');
  await expect(page.locator('.invrow')).toHaveCount(11);
  await expect(page.locator('.invrow', { hasText: 'limit reached' })).toHaveCount(1);
  expect((await friendsOf(code)).filter(d => d.rewarded)).toHaveLength(10);
});

test('a grown-up can switch invite links off', async ({ page }) => {
  await fresh(page);
  await newPlayer(page, { name: 'Cem', grade: 4 });
  await tab(page, 'me');
  await expect(page.locator('#invitecard')).toBeVisible();
  await openParents(page);
  await page.locator('input[data-k="invites"]').uncheck();
  await tab(page, 'me');
  await expect(page.locator('#invitecard')).toHaveCount(0);
});
