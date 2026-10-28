// Real game screenshots for the "How it works" landing page (src/landing.html shows them from landing/).
// Plays the local build like a family would, made-up players only, and saves cropped JPEGs to landing/.
// Run it again whenever the game's screens change:  cd tests && npm run shots
//
// Repeatable: a fixed clock (a Monday afternoon, then the debug "Next day" to Friday), a seeded Math.random
// (re-seeded before every question, lesson card and link code), no animations, and the sound muted.
// Family accounts use build/synctest.html (tools/mock-firebase.js): no real accounts, no real Firebase project.
// Every request that is not to this script's own server (or Google Fonts) is blocked.
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from '@playwright/test';
import { ROOT, typePin, tab, act } from './e2e/helpers.mjs';

const PORT = 8767, BASE = `http://127.0.0.1:${PORT}`;
const GAME = '/build/synctest.html#debug';
const OUT = join(ROOT, 'landing');
const MAX_KB = 200, QUALITY = 72;
const W = 390, H = 844;
// Monday 19 October 2026, 16:20 in London. The debug clock then moves the game's date on to Friday.
const START = new Date('2026-10-19T16:20:00+01:00');
// An Android tablet, so the parent's list of devices says "Android tablet, Chrome 131"
const UA = 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// Practised on Thursday and Friday (mastered on Friday): number answers, and a picture with most questions
const SKILL = 'g3.fracAmounts';
const t0 = Date.now();

// ---------- Build and serve ----------
execFileSync('python3', [join(ROOT, 'build.py')], { stdio: 'inherit' });
execFileSync('python3', [join(ROOT, 'tools/make-synctest.py')], { stdio: 'inherit' });
mkdirSync(OUT, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, BASE).pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    const body = await readFile(join(ROOT, path.endsWith('/') ? path + 'index.html' : path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch (e) { res.writeHead(404); res.end('not found'); }
});
await new Promise((ok, fail) => { server.once('error', fail); server.listen(PORT, '127.0.0.1', ok); })
  .catch(e => { console.error(`Port ${PORT} is busy (${e.code}). Is another shots run still going?`); process.exit(1); });

// ---------- Browser ----------
// Seeded Math.random (window.__seed(n) starts it again) and capture CSS: no delays, no particles, instant scrolling
const INIT = `(() => {
  let s = 1;
  Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.__seed = n => { s = n | 0; };
  const css = '*,*::before,*::after{animation-delay:0s!important;transition-delay:0s!important}' +
    'main#view,.sheet{scroll-behavior:auto!important}#fx{display:none!important}#toast{display:none!important}';
  document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); });
})();`;

const browser = await chromium.launch({ args: ['--mute-audio'] });
const context = await browser.newContext({
  baseURL: BASE, viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA,
  locale: 'en-GB', timezoneId: 'Europe/London', reducedMotion: 'reduce', colorScheme: 'dark', serviceWorkers: 'block',
});
await context.clock.install({ time: START });
await context.addInitScript(INIT);
// Nothing leaves this computer except the game's fonts
await context.route('**/*', route => {
  const host = new URL(route.request().url()).hostname;
  return host === '127.0.0.1' || host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com' ? route.continue() : route.abort();
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });

// ---------- Helpers ----------
const wait = ms => page.waitForTimeout(ms);
const run = (fn, arg) => page.evaluate(fn, arg);
const ACT = (name, d = {}) => run(([n, x]) => window.__pmlm.ACT[n](x), [name, d]);
const seedThen = (seed, sel) => run(([s, q]) => { window.__seed(s); document.querySelector(q).click(); }, [seed, sel]);
const snap = () => run(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]))));
// Another device in the same tab: its own localStorage; the mock server and the debug date stay in sessionStorage
async function become(saved) {
  await run(s => { localStorage.clear(); for (const [k, v] of Object.entries(JSON.parse(s || '{}'))) localStorage.setItem(k, v); }, saved);
  await page.reload();
  await page.locator('#view button').first().waitFor();
  await wait(1500);   // the family's data arrives
}
// Close the celebrations that pop up after a round (skill mastered, pet grew, level up, wish unlocked...)
async function closeCelebrations(first = 1300) {
  await wait(first);
  for (let i = 0; i < 10; i++) {
    const yay = page.locator('.celebrate button');
    if (!(await yay.count())) { await wait(400); if (!(await yay.count())) break; }
    await yay.first().click();
    await wait(250);
  }
}
// The game's two Google fonts (loaded on first use): true once both are ready, false after 8 seconds without them
const fontsOk = () => run(async () => {
  for (let i = 0; i < 40; i++) {
    await document.fonts.ready;
    const faces = [...document.fonts], ready = f => faces.some(x => x.family.replace(/"/g, '') === f && x.status === 'loaded');
    if (ready('Baloo 2') && ready('Atkinson Hyperlegible') && !faces.some(x => x.status === 'loading')) return true;
    await new Promise(r => setTimeout(r, 200));
  }
  return false;
});

// Answer the question on screen with the keypad or the choices: right, or a believable wrong number
const answer = (opts = {}) => run(({ wrong }) => {
  const R = window.__pmlm.R, q = R.q;
  const click = sel => { const el = document.querySelector(sel); if (!el) throw new Error('no ' + sel); el.click(); };
  const keys = s => { for (const ch of String(s)) click(`.k[data-k="${ch === '-' ? 'neg' : ch}"]`); };
  if (q.kind === 'choice') {
    const i = wrong ? R.choices.findIndex(c => c !== q.answer) : R.choices.indexOf(q.answer);
    click(`[data-act="choose"][data-i="${i}"]`);
    return q.kind;
  }
  if (q.kind === 'number') keys(wrong ? q.answer + (q.answer > 10 ? -2 : 2) : q.answer);
  else if (q.kind === 'coord') { keys(q.answer[0]); click('.k[data-k="next"]'); keys(q.answer[1]); }
  else {
    const [n, d] = q.answer, w = q.mixed ? Math.trunc(n / d) : 0;
    if (q.mixed && w) keys(w);
    if (q.mixed) click('.k[data-k="next"]');
    keys(q.mixed && w ? Math.abs(n) % d : n); click('.k[data-k="next"]'); keys(d);
  }
  click('.k[data-k="ok"]');
  return q.kind;
}, { wrong: !!opts.wrong });
// After a right answer: the next question, made from a known seed (what the game's own timer or Next button does)
const nextQ = seed => run(s => { window.__seed(s); window.__pmlm.ACT.next(); }, seed);
// Start a practice round of a skill whose first question passes `good` (tries seeds in order, so every run picks the same)
async function startRound(skill, good, from = 1) {
  const seed = await run(([id, src, from]) => {
    const ok = new Function('q', 'return ' + src);
    for (let s = from; s < from + 400; s++) {
      window.__seed(s); window.__pmlm.ACT.practise({ id });
      if (ok(window.__pmlm.R.q)) return s;
      window.__pmlm.ACT.leave();
    }
    throw new Error('no seed gives a good first question for ' + id);
  }, [skill, good.toString().replace(/^q\s*=>\s*/, ''), from]);
  return seed;
}
// The rest of a round: every answer right (one seed per question), until the results show
async function finishRound(base) {
  for (let i = 0; i < 40; i++) {
    if (await page.locator('.brainbig').count()) return;
    await answer();
    await nextQ(base + i);
  }
  throw new Error('the round did not finish');
}

// ---------- Capture ----------
const shots = [];
// Screenshot the full width from the top of `top` to the bottom of `bottom` (selectors or numbers in screen pixels).
// `last`: the last element matching `bottom`. `scroll` scrolls #view so that element sits at the top first.
// A region taller than the 390×844 screen gets a taller window for that one picture (the game's layout only changes
// with the height above 880 pixels, where keypads and the mascot get a little bigger; nothing taken here has them).
async function capture(name, { top, bottom, last = false, scroll, padTop = 12, padBottom = 12 } = {}) {
  if (!(await fontsOk())) console.warn(`  ⚠️  ${name}: the game's fonts did not load (offline?), the picture uses fallback fonts`);
  // No toasts or focus rings, and every animation at its end (a sheet still sliding up would be measured too low)
  await run(() => {
    document.querySelectorAll('#toast > *').forEach(e => e.remove());
    if (document.activeElement) document.activeElement.blur();
    document.getAnimations().forEach(x => { try { x.finish(); } catch (e) { /* an endless one */ } });
  });
  let clip;
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await run(({ top, bottom, last, scroll, padTop, padBottom }) => {
      const view = document.getElementById('view');
      const el = s => { const e = document.querySelector(s); if (!e) throw new Error('not found: ' + s); return e; };
      if (scroll) { view.scrollTop += el(scroll).getBoundingClientRect().top - view.getBoundingClientRect().top - padTop; }
      const y0 = typeof top === 'number' ? top : el(top).getBoundingClientRect().top - padTop;
      const be = typeof bottom === 'number' ? null : last ? [...document.querySelectorAll(bottom)].pop() || el(bottom) : el(bottom);
      const y1 = be ? be.getBoundingClientRect().bottom + padBottom : bottom;
      // What can show without being covered: the screen, and inside #view only its visible part
      const vr = view.getBoundingClientRect(), inView = be && view.contains(be);
      const limit = inView ? Math.min(innerHeight, vr.bottom) : innerHeight;
      return { y0: Math.max(0, y0), y1, limit, vh: innerHeight };
    }, { top, bottom, last, scroll, padTop, padBottom });
    if (r.y1 <= r.limit + 0.5) { clip = { x: 0, y: r.y0, width: W, height: Math.min(r.y1, r.vh) - r.y0 }; break; }
    await page.setViewportSize({ width: W, height: Math.ceil(r.vh + r.y1 - r.limit + 4) });
    await wait(400);
  }
  if (!clip) throw new Error(`${name}: the region does not fit on screen`);
  await wait(150);
  let buf, q = QUALITY;
  for (;;) {
    buf = await page.screenshot({ type: 'jpeg', quality: q, clip, animations: 'disabled', caret: 'hide', scale: 'device' });
    if (buf.length <= MAX_KB * 1024 || q <= 45) break;
    q -= 7;
  }
  writeFileSync(join(OUT, name), buf);
  const kb = Math.round(buf.length / 1024);
  if (q !== QUALITY) console.warn(`  ⚠️  ${name} was over ${MAX_KB} KB at quality ${QUALITY}: saved at quality ${q}`);
  shots.push({ name, kb, w: Math.round(clip.width * 2), h: Math.round(clip.height * 2) });
  const tall = page.viewportSize().height !== H ? `  (window ${W}×${page.viewportSize().height})` : '';
  console.log(`  ${name.padEnd(22)} ${String(kb).padStart(4)} KB  ${Math.round(clip.width * 2)}×${Math.round(clip.height * 2)}${tall}`);
  if (page.viewportSize().height !== H) { await page.setViewportSize({ width: W, height: H }); await wait(300); }
}

// =====================================================================================================
// Mia's tablet: a new player, the grown-up setup, a week of play
// =====================================================================================================
console.log('Kids: Mia, Grade 3, Space');
await page.goto(GAME);
await page.locator('[data-act="newplayer"]').waitFor();
await wait(500);
await capture('kids-welcome.jpg', { top: 'h1.logo', bottom: '#view .stack > p.center.muted:last-child', padTop: 28, padBottom: 28 });

await act(page, 'newplayer');
await page.fill('#np-name', 'Mia');
await page.locator('[data-act="np"][data-k="avatar"][data-v="🦊"]').click();
await page.locator('[data-act="np"][data-k="grade"][data-v="3"]').click();
await page.locator('[data-act="np"][data-k="theme"][data-v="space"]').click();
await capture('kids-new-player.jpg', { top: '#view h2', bottom: '[data-act="createplayer"]', padTop: 18, padBottom: 18 });

// The grown-ups' quick start appears a moment after the first player
await act(page, 'createplayer');
await page.locator('.sheet [data-act="qsgo"]').waitFor();
await wait(500);
await capture('grown-setup.jpg', { top: '.overlay .sheet', bottom: '.overlay .sheet', padTop: 20, padBottom: 0 });

// "Set up now": a PIN, then the wishes
await act(page, 'qsgo');
await typePin(page, '1234'); await wait(150); await typePin(page, '1234');
await page.locator('#wishcard').waitFor();
for (const [i, e, t] of [[0, '🍦', 'Ice cream trip'], [1, '🍿', 'Movie night'], [2, '🦁', 'Trip to the zoo'], [3, '🚲', 'A new bike']]) {
  await page.fill(`#we-${i}`, e); await page.fill(`#wt-${i}`, t);
}
await act(page, 'savewishes');
await wait(400);
await capture('grown-wishes.jpg', { top: '#wishcard', bottom: '#wishcard', scroll: '#wishcard', padTop: 10, padBottom: 10 });

// A pet egg, and the first quarter of Grade 3 mastered (debug), which unlocks the ice cream trip
await tab(page, 'play');
await act(page, 'pet');
await page.locator('[data-act="petkind"][data-k="feathers"]').click();
await act(page, 'petok');
await tab(page, 'parent');
await act(page, 'dbg', '[data-v="25"]');
await closeCelebrations(600);

// Monday to Wednesday: a perfect round a day (debug), on the next skills of the map
for (let day = 0; day < 3; day++) {
  if (day) await ACT('dbgday');
  await run(s => { window.__seed(s); window.__pmlm.ACT.dbgplay(); }, 100 + day);
  await closeCelebrations();
  await ACT('home');
}
// Thursday: a real round of fractions of amounts, all right first time
await ACT('dbgday');
await startRound(SKILL, q => q.kind === 'number');
await finishRound(1000);
await closeCelebrations();
await ACT('home');

// Friday afternoon, before today's round: the Play tab
await ACT('dbgday');
await tab(page, 'play');
await wait(400);
// From the top bar to the next-skill button (the map itself starts below the next wish and today's quests)
await capture('kids-map.jpg', { top: 0, bottom: '#view .card:has(.ring)', padBottom: 14 });

// A lesson card with a picture
await run(() => { window.__seed(7); window.__pmlm.ACT.learn({ id: 'g3.tables' }); });
for (let i = 0; i < 6; i++) {
  if (i > 0 && await run(() => !!document.querySelector('.lcard .viz'))) break;
  await seedThen(20 + i, '[data-act="lnext"]');
}
await wait(300);
await capture('kids-learn.jpg', { top: '#view > .stack > .row', bottom: '[data-act="lnext"]', padTop: 14, padBottom: 18 });
await ACT('home');

// Friday's round: the first question, then a wrong answer and its hint, then the rest right
await startRound(SKILL, q => q.kind === 'number' && !!q.visual, 2000);
await capture('kids-question.jpg', { top: '.playtop', bottom: '#tools', padTop: 12, padBottom: 12 });
await answer();
await nextQ(3000);
for (let i = 1; await run(() => window.__pmlm.R.q.kind !== 'number'); i++) { await answer(); await nextQ(3000 + i); }
await answer({ wrong: true });
await wait(200);
await capture('kids-hint.jpg', { top: '.playtop', bottom: '#fb', padTop: 12, padBottom: 12 });
await answer();
await nextQ(3100);
await finishRound(3200);
await closeCelebrations(1800);
await capture('kids-stars.jpg', { top: '#view h2', bottom: '.brainbig ~ .hintbox', last: true, padTop: 18, padBottom: 12 });
await ACT('home');

// Today's goal is met: streak, pet and the treasure chest
await tab(page, 'play');
await wait(400);
await capture('kids-chest.jpg', { top: '.card.today', bottom: '.card.today', scroll: '.card.today', padTop: 12, padBottom: 12 });

// A hat from the shop, then the Me tab
await tab(page, 'me');
const coins = await run(() => window.__pmlm.state.profiles[0].coins);
if (coins >= 20) {
  await page.locator('[data-act="buy"][data-v="🎀"]').click();
  await act(page, 'buyok');
  await wait(300);
} else console.warn(`  ⚠️  Mia has only ${coins} coins, so no hat`);
await run(() => { document.getElementById('view').scrollTop = 0; });
await capture('kids-me.jpg', { top: 0, bottom: '#view .themes', padBottom: 10 });

// Wishes: the ice cream trip is unlocked
await tab(page, 'wishes');
await wait(300);
await capture('kids-wish.jpg', { top: '#view > .stack > div:nth-child(2)', bottom: '#view .wishes', scroll: '#view > .stack > div:nth-child(2)', padTop: 14, padBottom: 12 });
const tablet = await snap();

// =====================================================================================================
// Family account (mock server): the parent's phone, a link code, Mia's tablet joins, the parent locks it to Mia
// =====================================================================================================
console.log('Grown-ups: family account (mock backend)');
// Real time catches up with the game's Friday, so "last seen" on the parent's phone says Friday too
await page.clock.setSystemTime(new Date(START.getTime() + 4 * 864e5 + 60 * 60e3));
await run(() => sessionStorage.removeItem('pmlm.dayShift'));
await become('{}');
await page.locator('[data-act="loginopen"]').click();
await page.locator('#pl-email').waitFor();
await page.fill('#pl-email', 'parent@example.com');
await page.fill('#pl-pass', 'made-up-pass');   // the mock's own account, shown as dots
await capture('grown-login.jpg', { top: '.overlay .sheet', bottom: '.overlay .sheet', padTop: 20, padBottom: 0 });
await act(page, 'signupemail');
await page.getByText('Devices and parents').waitFor();
await wait(800);
// A link code from known "random" numbers, so it is the same every time
await run(() => { let i = 0; const pick = [9, 0, 25, 6, 13, 3, 24, 16]; crypto.getRandomValues = a => { for (let k = 0; k < a.length; k++) a[k] = pick[(i++) % pick.length]; return a; }; });
await act(page, 'mkcode', '[data-r="device"]');
await page.locator('.codebox').waitFor();
const code = (await page.locator('.codebox').innerText()).trim();
await wait(300);
await capture('grown-code.jpg', { top: '#view .card.stack:has(.codebox) > h3', bottom: '[data-act="codedone"]', scroll: '#view .card.stack:has(.codebox)', padTop: 16, padBottom: 16 });
const phone = await snap();

// Mia's tablet: Parents → Family account → Link to my family
await become(tablet);
await tab(page, 'parent');
await typePin(page, '1234');
await page.locator('.card [data-act="linkopen"]').click();
await page.locator('#lk-code').waitFor();
await page.fill('#lk-code', code);
await page.fill('#lk-name', 'Mia\'s tablet');
await capture('grown-link.jpg', { top: '.overlay .sheet', bottom: '.overlay .sheet', padTop: 20, padBottom: 0 });
await act(page, 'linkgo');
await page.getByText('Linked to your family as').or(page.locator('#tabs:visible')).first().waitFor();
await wait(2500);   // Mia's progress goes up to the family

// The parent's phone: Mia is there, and the tablet is locked to her
await become(phone);
await tab(page, 'parent');
await page.locator('select.devlock').waitFor();
const mia = await run(() => window.__pmlm.state.profiles.find(p => p.name === 'Mia').id);
await page.selectOption('select.devlock', mia);
await wait(800);
await capture('grown-lock.jpg', { top: '#view .card.stack:has(.devrow) > h3', bottom: '.devrow', scroll: '#view .card.stack:has(.devrow)', padTop: 16, padBottom: 16 });

// =====================================================================================================
await browser.close();
server.close();
const total = shots.reduce((a, s) => a + s.kb, 0), big = shots.filter(s => s.kb > MAX_KB);
console.log(`\n${shots.length} pictures in landing/, ${total} KB in all, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (errors.length) console.warn('Errors on the page:\n  ' + [...new Set(errors)].join('\n  '));
if (big.length) { console.error(`Over ${MAX_KB} KB: ${big.map(s => s.name).join(', ')}`); process.exit(1); }
