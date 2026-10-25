// The game as it was before this release still works the same way: every main flow, start to finish.
import { test, expect } from '@playwright/test';
import { newPlayer, openParents, playRound, home, act, tab, state, watchErrors } from './helpers.mjs';

test.beforeEach(async ({ page }) => { await page.goto('/index.html'); await page.evaluate(() => localStorage.clear()); await page.reload(); });

test('welcome → player → placement → lesson → practice → results', async ({ page }) => {
  const errors = watchErrors(page);
  await expect(page.getByText('Add a player')).toBeVisible();
  await newPlayer(page, { name: 'Ana', grade: 3 });
  await expect(page.locator('.hero')).toContainText('0 of 22 skills mastered');
  await act(page, 'place'); await act(page, 'placego'); await playRound(page);
  await expect(page.locator('#view h2')).toContainText('Level found!');
  await home(page);
  await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'learn');
  await expect(page.locator('.lcard')).toBeVisible();
  if (await page.locator('[data-act="sayl"]').count()) await expect(page.locator('[data-act="sayl"]')).toBeVisible();
  while (await page.locator('[data-act="lnext"]').count()) await act(page, 'lnext');
  await act(page, 'tryit'); await playRound(page);
  await expect(page.getByText('Lesson complete!')).toBeVisible();
  await page.locator('[data-act="practise"].pulse').click();
  await expect(page.locator('.qcard')).toBeVisible();
  await expect(page.locator('[data-act="hint"]')).toBeVisible();
  await playRound(page);
  await expect(page.locator('#view h2')).toContainText('Round complete!');
  const s = await state(page);
  expect(s.profiles[0].stats.rounds).toBe(1);
  expect(s.profiles[0].stats.answered).toBeGreaterThanOrEqual(10);
  expect(Object.keys(s.profiles[0].trophies).length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('parents: PIN, wishes, debug mastery unlocks a wish, granting, report table', async ({ page }) => {
  await page.goto('/index.html?debug=1');
  await newPlayer(page, { name: 'Ben', grade: 2 });
  await openParents(page);
  await page.fill('#wt-0', 'Ice cream'); await act(page, 'savewishes');
  await act(page, 'dbg', '[data-v="25"]');
  await expect(page.locator('.celebrate')).toContainText('Wish unlocked!');
  await page.locator('.celebrate button').click();
  await act(page, 'grant', '[data-i="0"]');
  await expect(page.getByText('✅ Granted')).toBeVisible();
  await expect(page.locator('table.report tbody tr')).toHaveCount(20);
  await act(page, 'lock');
  await expect(page.getByText('Enter the parent PIN')).toBeVisible();
  const s = await state(page);
  expect(s.profiles[0].grades[2].wishes[0].status).toBe('granted');
});

test('boss battle, fix-it round, shop, themes and sound', async ({ page }) => {
  await page.goto('/index.html?debug=1');
  await newPlayer(page, { name: 'Cleo', grade: 4 });
  await openParents(page);
  await act(page, 'dbg', '[data-v="100"]');
  for (let i = 0; i < 30 && await page.locator('.celebrate button').count(); i++) { await page.locator('.celebrate button').first().click(); await page.waitForTimeout(150); }
  await act(page, 'dbgcoins');
  await tab(page, 'play');
  await page.locator('[data-act="boss"]').first().click(); await act(page, 'bossgo');
  await expect(page.locator('.bossbar')).toBeVisible();
  await playRound(page); await home(page);
  await act(page, 'fixit'); await playRound(page);
  await expect(page.locator('#view h2')).toContainText('Fix-it done!');
  await home(page);
  await tab(page, 'me');
  await page.locator('[data-act="buy"][data-v="👑"]').click(); await act(page, 'buyok');
  await page.locator('[data-act="theme"][data-id="candy"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-world', 'candy');
  await act(page, 'mute');
  const s = await state(page);
  expect(s.profiles[0].hat).toBe('👑');
  expect(s.settings.sfx).toBe(false);
  expect(s.profiles[0].stats.rounds).toBe(2);
});

test('backup code: copy it, then add or replace players with it', async ({ page }) => {
  await newPlayer(page, { name: 'Dan', grade: 5 });
  await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page);
  await openParents(page);
  await act(page, 'export');
  const code = await page.inputValue('#backup');
  await page.evaluate(() => localStorage.clear()); await page.reload();
  await newPlayer(page, { name: 'Eve', grade: 1 });
  await openParents(page);
  await page.fill('#backup', code); await act(page, 'import'); await act(page, 'importadd');
  let s = await state(page);
  expect(s.profiles.map(p => p.name).sort()).toEqual(['Dan', 'Eve']);
  expect(s.profiles.find(p => p.name === 'Dan').stats.rounds).toBe(1);
  await page.fill('#backup', code); await act(page, 'import'); await act(page, 'importok');
  s = await state(page);
  expect(s.profiles.map(p => p.name)).toEqual(['Dan']);
});
