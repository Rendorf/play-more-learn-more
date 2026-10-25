// Children's progress is never lost:
//  1. Progress saved by the live version opens in the new version with every value exactly as before
//     (the same steps on the live version and the new version give identical saves, apart from new fields).
//  2. Playing on the new version only adds: counters go up, mastery, wishes, coins and purchases stay.
//  3. Rolling back is safe: the live version opens the new version's saves and keeps the new fields.
//  4. Backup codes from the live version work in the new version.
//  5. The preview copy never touches the real saved progress on the same phone.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { oldBuild, newPlayer, openParents, typePin, playRound, home, act, tab, state, STORE, watchErrors } from './helpers.mjs';

const FIXTURES = readdirSync(new URL('../fixtures/', import.meta.url)).filter(f => f.endsWith('.json'))
  .map(f => Object.assign({ file: f }, JSON.parse(readFileSync(new URL(`../fixtures/${f}`, import.meta.url), 'utf8'))));
// Fields this release adds. Anything else that differs is a bug.
const NEW_FIELDS = [/^profiles\.\d+\.stats\.active$/, /^profiles\.\d+\.week(\.|$)/, /^profiles\.\d+\.nickSeed$/, /^profiles\.\d+\.board$/, /^settings\.stats$/];
const isNew = path => NEW_FIELDS.some(r => r.test(path));

// Every path in a, with its value, must be the same in b
function sameOldValues(a, b, path = '', out = []) {
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) { out.push(`${path}: was ${JSON.stringify(a).slice(0, 80)}, now ${JSON.stringify(b)}`); return out; }
    for (const k of Object.keys(a)) sameOldValues(a[k], b[k], path ? `${path}.${k}` : k, out);
    if (Array.isArray(a) && a.length !== b.length) out.push(`${path}: length ${a.length} → ${b.length}`);
  } else if (a !== b) out.push(`${path}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
  return out;
}
function extraPaths(a, b, path = '', out = []) {
  if (b && typeof b === 'object') for (const k of Object.keys(b)) {
    const p = path ? `${path}.${k}` : k;
    if (!a || typeof a !== 'object' || !(k in a)) out.push(p); else extraPaths(a[k], b[k], p, out);
  }
  return out;
}

// Open a page with this saved progress already on the "device"
async function openWith(page, url, saved) {
  await page.addInitScript(([k, v]) => {
    if (!sessionStorage.getItem('__seeded')) { localStorage.clear(); localStorage.setItem(k, v); sessionStorage.setItem('__seeded', '1'); }
  }, [STORE, saved]);
  await page.goto(url);
  await page.locator('#view button').first().waitFor();
}
// Look at everything without playing, then cause one save (sound off and on again)
async function lookAround(page, pin) {
  for (const t of ['wishes', 'me', 'play']) { await tab(page, t); await page.waitForTimeout(150); }
  await tab(page, 'parent'); await typePin(page, pin); await page.locator('[data-act="savewishes"]').waitFor();
  await tab(page, 'play'); await act(page, 'mute'); await act(page, 'mute');
}

for (const fx of FIXTURES) {
  test.describe(`progress saved by ${fx.madeWith.slice(0, 7)} (${fx.file})`, () => {
    test.use({ timezoneId: 'Asia/Baku' });
    test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-10-26T10:00:00+04:00')); });

    test('opens in the new version exactly as in the live version', async ({ browser }) => {
      const old = oldBuild();
      const run = async url => {
        const ctx = await browser.newContext({ timezoneId: 'Asia/Baku' });
        const page = await ctx.newPage();
        await page.clock.setFixedTime(new Date('2026-10-26T10:00:00+04:00'));
        const errors = watchErrors(page);
        await openWith(page, url, fx.state);
        await lookAround(page, fx.pin);
        const s = await state(page);
        await ctx.close();
        return { s, errors };
      };
      const before = await run(old.page), after = await run('/index.html');
      expect(after.errors).toEqual([]);
      expect(sameOldValues(before.s, after.s)).toEqual([]);
      expect(extraPaths(before.s, after.s).filter(p => !isNew(p))).toEqual([]);
      // and nothing was lost compared with the fixture itself (apart from today's new quests and save times)
      const fixture = JSON.parse(fx.state);
      expect(sameOldValues(fixture, after.s).filter(d => !/^profiles\.\d+\.(quests|updatedAt)|^updatedAt/.test(d))).toEqual([]);
    });

    test('playing on the new version only adds', async ({ page }) => {
      const errors = watchErrors(page);
      const fixture = JSON.parse(fx.state);
      await openWith(page, '/index.html', fx.state);
      await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page);
      const s = await state(page);
      expect(errors).toEqual([]);
      expect(s.profiles.map(p => p.id)).toEqual(fixture.profiles.map(p => p.id));
      for (const [i, was] of fixture.profiles.entries()) {
        const now = s.profiles[i];
        for (const k of Object.keys(was.stats)) expect(now.stats[k], `${was.name} stats.${k}`).toBeGreaterThanOrEqual(was.stats[k]);
        expect(now.coins).toBeGreaterThanOrEqual(was.coins);
        expect(now.brain).toBeGreaterThanOrEqual(was.brain);
        expect(now.owned).toEqual(was.owned);
        expect(Object.keys(now.trophies)).toEqual(expect.arrayContaining(Object.keys(was.trophies)));
        for (const [g, gs] of Object.entries(was.grades)) {
          for (const [id, ss] of Object.entries(gs.skills)) {
            if (ss.mastered) expect(now.grades[g].skills[id].mastered, `${was.name} ${id} stays mastered`).toBe(ss.mastered);
            expect(now.grades[g].skills[id].stars).toBeGreaterThanOrEqual(ss.stars);
          }
          expect(now.grades[g].wishes.map(w => w.text)).toEqual(gs.wishes.map(w => w.text));
          gs.wishes.forEach((w, k) => { if (w.status !== 'locked') expect(now.grades[g].wishes[k].status).toBe(w.status); });
          for (const [u, won] of Object.entries(gs.bosses)) if (won) expect(now.grades[g].bosses[u]).toBe(true);
        }
      }
      const me = s.profiles.find(p => p.id === s.current);
      expect(me.week.q).toBeGreaterThanOrEqual(10);
      expect(me.stats.active).toBeGreaterThanOrEqual(0);
    });

    test('rolling back is safe: the live version opens new saves and keeps the new fields', async ({ browser }) => {
      const old = oldBuild();
      // play on the new version
      let ctx = await browser.newContext(), page = await ctx.newPage();
      await openWith(page, '/index.html', fx.state);
      await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page);
      const fromNew = await state(page);
      await ctx.close();
      // then on the live version
      ctx = await browser.newContext(); page = await ctx.newPage();
      const errors = watchErrors(page);
      await openWith(page, old.page, JSON.stringify(fromNew));
      await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page);
      const s = await state(page);
      await ctx.close();
      expect(errors).toEqual([]);
      for (const [i, p] of fromNew.profiles.entries()) {
        for (const k of ['week', 'nickSeed', 'board']) expect(s.profiles[i][k]).toEqual(p[k]);
        expect(s.profiles[i].stats.active).toBe(p.stats.active);
        expect(s.profiles[i].stats.rounds).toBeGreaterThanOrEqual(p.stats.rounds);
      }
      // and back on the new version again, everything still opens
      ctx = await browser.newContext(); page = await ctx.newPage();
      const errors2 = watchErrors(page);
      await openWith(page, '/index.html', JSON.stringify(s));
      await lookAround(page, fx.pin);
      await ctx.close();
      expect(errors2).toEqual([]);
    });

    test('a backup code from the live version adds the players to a new-version device', async ({ page }) => {
      await page.goto('/index.html');
      await page.evaluate(() => localStorage.clear()); await page.reload();
      await newPlayer(page, { name: 'Someone New', grade: 1 });
      await openParents(page);
      await page.fill('#backup', fx.backup); await act(page, 'import'); await act(page, 'importadd');
      const s = await state(page), fixture = JSON.parse(fx.backup);
      expect(s.profiles.length).toBe(fixture.profiles.length + 1);
      for (const p of fixture.profiles) {
        const got = s.profiles.find(x => x.id === p.id);
        expect(sameOldValues(p, got).filter(d => !/^quests|^updatedAt/.test(d))).toEqual([]);
      }
    });
  });
}

test('the preview copy never reads or changes the real progress on the same phone', async ({ page }) => {
  const fx = FIXTURES[0];
  await openWith(page, '/build/preview/index.html', fx.state);
  await expect(page.locator('.envribbon')).toHaveText('PREVIEW');
  await expect(page.getByText('Add a player')).toBeVisible();   // the real players are not visible here
  await newPlayer(page, { name: 'Preview Kid', grade: 2 });
  await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page);
  await page.waitForTimeout(500);
  const keys = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])));
  expect(keys[STORE]).toBe(fx.state);
  expect(JSON.parse(keys['pmlm-preview.v1']).profiles[0].name).toBe('Preview Kid');
  expect(Object.keys(keys).filter(k => k.startsWith('pmlm.') && k !== STORE)).toEqual([]);
});
