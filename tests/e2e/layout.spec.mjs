// The new screens fit phones and tablets (no sideways scrolling, no cut-off tabs), in a dark and a light world.
import { test, expect } from '@playwright/test';
import { clearEmulators, putDoc, newPlayer, openParents, tab, act } from './helpers.mjs';

async function noOverflow(page, where) {
  const bad = await page.evaluate(() => {
    const w = document.documentElement.clientWidth, out = [];
    for (const el of document.querySelectorAll('#view *, .sheet *, #tabs *')) {
      if (el.closest('.tablewrap, .path, .viz') || !el.getClientRects().length) continue;
      const r = el.getBoundingClientRect();
      if (r.right > w + 1 || r.left < -1) out.push(`${el.tagName.toLowerCase()}.${el.className} (${Math.round(r.left)}–${Math.round(r.right)} of ${w})`);
    }
    for (const t of document.querySelectorAll('.tab')) if (t.scrollWidth > t.clientWidth + 1) out.push(`tab "${t.innerText}" is cut off`);
    return out.slice(0, 10);
  });
  expect(bad, where).toEqual([]);
}

test('quick start, Top tab and Parents cards fit the screen', async ({ page }) => {
  await clearEmulators();
  const week = await (async () => { await page.goto('/index.html?emu=1'); return page.evaluate(() => Board.weekId(new Date())); })();
  for (let i = 1; i <= 4; i++) await putDoc(`leaderboard/plong${i}_u${i}`, { pid: `plong${i}`, owner: `u${i}`, nick: 'Fearless Hedgehog 99', av: '🦄', hat: '👑', g: 9, pts: 99999999, wpts: 9999999, wk: week, q: 10, t: i });
  await page.evaluate(() => localStorage.clear()); await page.reload();
  await newPlayer(page, { name: 'Maximilian', grade: 9, closeQuickStart: false });
  await page.locator('.sheet ol.steps').waitFor();
  await noOverflow(page, 'quick start');
  await page.locator('.sheet [data-act="close"]').last().click();
  for (const world of ['space', 'candy']) {
    await tab(page, 'me'); await page.locator(`[data-act="theme"][data-id="${world}"]`).click();
    await tab(page, 'top'); await page.locator('.lbrow').first().waitFor();
    await noOverflow(page, `Top tab (${world})`);
    await openParents(page);
    await noOverflow(page, `Parents (${world})`);
  }
});
