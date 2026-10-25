// Plays the version that is live now (main) like a family would, and saves the progress it leaves behind in
// tests/fixtures/. tests/e2e/progress.spec.mjs loads that progress into every new version to prove nothing is lost.
// Run it again only when you want fresh fixtures from a newer live version:  cd tests && npm run fixtures
// (needs the local server: python3 -m http.server 8766 --bind 127.0.0.1, from the repository root)
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { oldBuild, newPlayer, openParents, typePin, playRound, home, act, tab, STORE } from './e2e/helpers.mjs';

const old = oldBuild();
const browser = await chromium.launch();
const page = await browser.newPage({ baseURL: 'http://127.0.0.1:8766' });
await page.goto(old.page + '?debug=1');

// Ana, Grade 3: placement check, a lesson, practice, wishes, debug mastery, shop, theme, boss, fix-it
await newPlayer(page, { name: 'Fixture Ana', grade: 3, closeQuickStart: false });
await act(page, 'place'); await act(page, 'placego'); await playRound(page); await home(page);
await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'learn');
while (await page.locator('[data-act="lnext"]').count()) await act(page, 'lnext');
await act(page, 'tryit'); await playRound(page);
await page.locator('[data-act="practise"].pulse').click(); await playRound(page); await home(page);
await tab(page, 'parent'); await typePin(page, '1234'); await typePin(page, '1234');
await page.locator('[data-act="savewishes"]').waitFor();
for (const [i, w] of ['Ice cream trip', 'Movie night', 'New book', 'A new bike'].entries()) await page.fill(`#wt-${i}`, w);
await act(page, 'savewishes');
await act(page, 'dbg', '[data-v="50"]');
for (let i = 0; i < 4; i++) { await page.waitForTimeout(900); if (await page.locator('.celebrate button').count()) await page.locator('.celebrate button').first().click(); }
await act(page, 'grant', '[data-i="0"]');
await act(page, 'dbgcoins');
await tab(page, 'me');
await page.locator('[data-act="buy"][data-v="🎩"]').click(); await act(page, 'buyok');
await page.locator('[data-act="buy"][data-v="🦁"]').click(); await act(page, 'buyok');
await page.locator('[data-act="theme"][data-id="ocean"]').click();
await tab(page, 'play');
await page.locator('[data-act="boss"]').first().click(); await act(page, 'bossgo'); await playRound(page); await home(page);
if (await page.locator('[data-act="fixit"]:not([disabled])').count()) { await act(page, 'fixit'); await playRound(page); await home(page); }

// Ben, Grade 6: one practice round
await page.locator('[data-act="players"]').click(); await act(page, 'newplayer');
await page.fill('#np-name', 'Fixture Ben'); await page.locator('[data-act="np"][data-k="grade"][data-v="6"]').click(); await act(page, 'createplayer');
await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page);

// Cleo, Grade 9: the whole grade mastered and the big wish unlocked
await page.locator('[data-act="players"]').click(); await act(page, 'newplayer');
await page.fill('#np-name', 'Fixture Cleo'); await page.locator('[data-act="np"][data-k="grade"][data-v="9"]').click(); await act(page, 'createplayer');
await openParents(page);
await page.fill('#wt-3', 'Theme park day'); await act(page, 'savewishes');
await act(page, 'dbg', '[data-v="100"]');
for (let i = 0; i < 6; i++) { await page.waitForTimeout(900); if (await page.locator('.celebrate button').count()) await page.locator('.celebrate button').first().click(); }

// The raw saved progress and a backup code, exactly as the live version writes them
await act(page, 'export');
const backup = await page.inputValue('#backup');
const raw = await page.evaluate(k => localStorage.getItem(k), STORE);
const s = JSON.parse(raw);
const file = new URL(`fixtures/live-${old.ref.slice(0, 7)}.json`, import.meta.url);
writeFileSync(file, JSON.stringify({ madeWith: old.ref, madeAt: new Date().toISOString(), pin: '1234', state: raw, backup }, null, 1) + '\n');
console.log(`Saved ${file.pathname}: ${s.profiles.map(p => `${p.name} (Grade ${p.grade}, ${p.stats.rounds} rounds, ${p.coins} coins)`).join(', ')}`);
await browser.close();
