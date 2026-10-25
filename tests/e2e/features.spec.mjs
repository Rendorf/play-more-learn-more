// The new features, end to end, against the local Firebase emulators (?emu=1) with the real firestore.rules.
import { test, expect } from '@playwright/test';
import { clearEmulators, docs, putDoc, waitForDocs, newPlayer, openParents, typePin, playRound, home, act, tab, state, watchErrors } from './helpers.mjs';

const EMU = '/index.html?emu=1';
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
async function fresh(page) { await clearEmulators(); await page.goto(EMU); await page.evaluate(() => localStorage.clear()); await page.reload(); }
async function practiseRound(page) { await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page); }

test('grown-up quick start: PIN first, then straight to the wishes', async ({ page }) => {
  await fresh(page);
  await newPlayer(page, { name: 'Ana', grade: 3, closeQuickStart: false });
  await expect(page.locator('.sheet')).toContainText('Grown-ups: 1-minute setup', { timeout: 5000 });
  const reminders = await page.evaluate(() => Online.push.configured);
  await expect(page.locator('.sheet ol.steps li')).toHaveCount(reminders ? 4 : 3);   // PIN, wish, Home Screen (+ reminder once a key is set)
  await act(page, 'qsgo');
  await expect(page.getByText('Create a 4-digit parent PIN')).toBeVisible();
  await typePin(page); await typePin(page);
  await expect(page.locator('#wishcard')).toBeInViewport({ timeout: 5000 });
  await page.fill('#wt-0', 'Ice cream trip'); await act(page, 'savewishes');
  const ev = await waitForDocs('events', e => e.type === 'wishset');
  expect(ev[0].n).toBe(1);
  expect((await docs('events')).map(e => e.type)).toEqual(expect.arrayContaining(['open', 'player', 'wishset']));
});

test('anonymous stats: lessons and rounds are counted, with no names', async ({ page }) => {
  const errors = watchErrors(page);
  await fresh(page);
  await page.goto(EMU + '&src=ff1'); await page.reload();
  await newPlayer(page, { name: 'Secret Name', grade: 2 });
  await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'learn');
  while (await page.locator('[data-act="lnext"]').count()) await act(page, 'lnext');
  await act(page, 'tryit'); await playRound(page);
  await page.locator('[data-act="practise"].pulse').click(); await playRound(page); await home(page);
  const ev = await waitForDocs('events', e => e.type === 'round');
  const s = await state(page), p = s.profiles[0];
  const round = ev.find(e => e.type === 'round');
  expect(round).toMatchObject({ p: p.id, g: 2, mode: 'practice', n: 10, src: 'ff1', day: today() });
  expect((await docs('events')).some(e => e.type === 'lesson' && e.p === p.id)).toBe(true);
  expect(JSON.stringify(await docs('events'))).not.toContain('Secret Name');
  expect(errors).toEqual([]);
});

test('🚩 question reports and parents\' messages reach the game makers', async ({ page }) => {
  await fresh(page);
  await newPlayer(page, { name: 'Ben', grade: 4 });
  await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise');
  const question = await page.locator('.qtext').innerText();
  await act(page, 'flag');
  await expect(page.locator('.sheet')).toContainText('What’s wrong?');
  await page.locator('[data-act="flaggo"][data-r="wrong"]').click();
  await expect(page.locator('#toast')).toContainText('We will check this question');
  await expect(page.locator('.qcard')).toBeVisible();   // the round carries on
  const fb = await waitForDocs('feedback', f => f.kind === 'question');
  expect(fb[0]).toMatchObject({ reason: 'wrong', g: 4, mode: 'practice' });
  expect(question.replace(/\s+/g, ' ')).toContain(fb[0].q.replace(/\s+/g, ' ').slice(0, 20));
  expect(fb[0].ans).toBeTruthy();
  await playRound(page); await home(page);
  await openParents(page);
  await page.fill('#fbtext', 'The children love the boss battles!'); await page.fill('#fbname', 'A parent');
  await act(page, 'sendfb');
  const msg = await waitForDocs('feedback', f => f.kind === 'general');
  expect(msg[0]).toMatchObject({ text: 'The children love the boss battles!', name: 'A parent' });
});

test('switching stats off stops sending them', async ({ page }) => {
  await fresh(page);
  await newPlayer(page, { name: 'Cleo', grade: 3 });
  await openParents(page);
  await page.locator('input[data-k="stats"]').uncheck();
  await tab(page, 'play');
  await practiseRound(page);
  await page.waitForTimeout(4000);
  expect((await docs('events')).filter(e => e.type === 'round')).toEqual([]);
  expect((await state(page)).settings.stats).toBe(false);
});

const seed = (i, extra) => putDoc(`leaderboard/pseed${i}_u${i}`, Object.assign({
  pid: `pseed${i}`, owner: `u${i}`, nick: `Seed Player ${i}`, av: '🐼', hat: '', g: (i % 3) + 2, pts: i * 900, min: 60 - i * 7, mst: i, str: 6 - i,
  day: today(), q: i * 30, acc: 50 + i * 8, wk: 'WEEK', wpts: i * 300, wmin: 5 * i, wq: i * 10, wmst: i % 2, v: 'seed', t: 1000 + i,
}, extra));

test('leaderboard: ranking, filters, my own row, nickname and hiding', async ({ page }) => {
  await fresh(page);
  const week = await page.evaluate(() => Board.weekId(new Date()));
  for (let i = 1; i <= 5; i++) await seed(i, { wk: week });
  // the same child from two devices: only the newest counts
  await seed(6, { pid: 'pdup', nick: 'Twin Device', pts: 99999, wpts: 99999, t: 10 });
  await putDoc('leaderboard/pdup_u7', { pid: 'pdup', owner: 'u7', nick: 'Twin Device', av: '🐸', g: 3, pts: 10, wpts: 10, wk: week, day: today(), t: 5000 });
  await newPlayer(page, { name: 'Dina', grade: 3 });
  await practiseRound(page);
  await tab(page, 'top');
  const names = () => page.locator('.lbrow .lbname b').allInnerTexts();
  await expect(page.locator('.lbrow').first()).toContainText('Seed Player 5');
  expect((await names()).filter(n => n === 'Twin Device')).toHaveLength(1);
  await expect(page.locator('.lbrow', { hasText: 'Twin Device' })).toContainText('10');
  await expect(page.locator('.lbrow.me')).toContainText('You · Grade 3');
  await act(page, 'lbmetric', '[data-v="min"]');
  await expect(page.locator('.lbrow').first()).toContainText('Seed Player 5');   // 25 minutes this week
  await act(page, 'lbperiod', '[data-v="all"]');
  await expect(page.locator('.lbrow').first()).toContainText('Seed Player 1');   // 53 minutes in all
  await act(page, 'lbmetric', '[data-v="acc"]');
  await expect(page.locator('.lbrow').first()).toContainText('Seed Player 5');
  expect(await names()).not.toContain('Seed Player 1');   // only 30 questions: not enough for first-try %
  await act(page, 'lbmetric', '[data-v="str"]');
  await expect(page.locator('.lbrow').first()).toContainText('Seed Player 1');
  await page.selectOption('#lbgrade', '4');
  for (const row of await page.locator('.lbrow .lbname small').allInnerTexts()) expect(row).toContain('Grade 4');
  await page.selectOption('#lbgrade', '0');
  // my nickname, and a new one
  const s = await state(page), me = s.profiles[0];
  const nick = await page.evaluate(id => Board.nick(id, 0), me.id);
  await expect(page.locator('#view .card').first()).toContainText(nick);
  await act(page, 'reroll');
  const nick2 = await page.evaluate(id => Board.nick(id, 1), me.id);
  await expect(page.locator('#view .card').first()).toContainText(nick2);
  await expect.poll(async () => (await docs('leaderboard')).filter(d => d.pid === me.id).map(d => d.nick)).toContain(nick2);
  // a grown-up hides the child
  await openParents(page);
  await page.selectOption(`select[data-change="pboard"][data-id="${me.id}"]`, 'hidden');
  await expect.poll(async () => (await docs('leaderboard')).filter(d => d.pid === me.id).map(d => d.hid)).toContain(true);
  await tab(page, 'top');
  await expect(page.locator('#view')).toContainText('A grown-up has hidden Dina from the leaderboard');
  expect(await names()).not.toContain(nick2);
  // nobody's name appears unless a grown-up chooses it
  expect(JSON.stringify(await docs('leaderboard'))).not.toContain('Dina');
});

test('looking at the leaderboard and Parents never changes any child\'s saved progress', async ({ page }) => {
  // Family sync keeps the newest copy of each child, so a change made just by looking could overwrite real progress
  await fresh(page);
  await newPlayer(page, { name: 'Older Sibling', grade: 7 });
  await page.locator('[data-act="players"]').click(); await act(page, 'newplayer');
  await page.fill('#np-name', 'Younger Sibling'); await page.locator('[data-act="np"][data-k="grade"][data-v="2"]').click(); await act(page, 'createplayer');
  await practiseRound(page);
  const before = (await state(page)).profiles;
  await tab(page, 'top'); await page.locator('.lbrow.me').waitFor();
  await act(page, 'lbperiod', '[data-v="all"]'); await act(page, 'lbmetric', '[data-v="mst"]');
  await openParents(page);
  await tab(page, 'top'); await tab(page, 'play');
  await act(page, 'mute'); await act(page, 'mute');   // forces a save
  expect((await state(page)).profiles).toEqual(before);
});

test('reminders: turn on, change the time, see a sample, turn off', async ({ page }) => {
  // A test browser has no push service: stand in for the browser's permission prompt and subscription
  await page.addInitScript(() => {
    Notification.requestPermission = async () => 'granted';
    Object.defineProperty(Notification, 'permission', { get: () => 'granted' });
    let sub = null;
    const fake = { endpoint: 'https://push.example.test/sub/abc', toJSON() { return { endpoint: this.endpoint, keys: { p256dh: 'BPk-test', auth: 'auth-test' } }; }, unsubscribe: async () => { sub = null; return true; } };
    PushManager.prototype.subscribe = async () => (sub = fake);
    PushManager.prototype.getSubscription = async () => sub;
    ServiceWorkerRegistration.prototype.showNotification = async function (title, opts) { window.__shown = { title, body: opts.body }; };
  });
  const GAME = '/tests/.cache/vapid/index.html?emu=1';   // the game with a reminder key (see setup.mjs)
  await clearEmulators(); await page.goto(GAME); await page.evaluate(() => localStorage.clear()); await page.reload();
  await newPlayer(page, { name: 'Eli', grade: 5, closeQuickStart: false });
  await expect(page.locator('.sheet ol.steps li')).toHaveCount(4, { timeout: 5000 });   // now with the daily reminder
  await page.locator('.sheet [data-act="close"]').last().click();
  await openParents(page);
  await page.locator('#remcard').scrollIntoViewIfNeeded();
  await page.selectOption('#remhour', '18');
  await act(page, 'remon');
  await expect(page.locator('#toast')).toContainText('Daily reminder is on');
  let push = await waitForDocs('push');
  expect(push[0]).toMatchObject({ hour: 18, sub: { endpoint: 'https://push.example.test/sub/abc', p256dh: 'BPk-test', auth: 'auth-test' } });
  expect(push[0].kids[0].av).toBeTruthy();
  expect(JSON.stringify(push)).not.toContain('Eli');
  await page.selectOption('select[data-change="remhour"]', '19');
  await expect.poll(async () => (await docs('push'))[0].hour).toBe(19);
  await act(page, 'remsample');
  await expect.poll(() => page.evaluate(() => window.__shown && window.__shown.title)).toBeTruthy();
  // after a round, the server knows the child played today (so there is no reminder today)
  await tab(page, 'play'); await practiseRound(page);
  await expect.poll(async () => (await docs('push'))[0].kids[0].last, { timeout: 15000 }).toBe(today());
  await openParents(page);
  await act(page, 'remoff');
  await expect.poll(async () => (await docs('push')).length).toBe(0);
});

test('offline: the game plays normally when the online services cannot be reached', async ({ page }) => {
  const errors = watchErrors(page);
  await page.route(/127\.0\.0\.1:(8080|9099)/, r => r.abort());
  await page.goto(EMU); await page.evaluate(() => localStorage.clear()); await page.reload();
  await newPlayer(page, { name: 'Finn', grade: 1 });
  await practiseRound(page);
  expect((await state(page)).profiles[0].stats.rounds).toBe(1);
  await tab(page, 'top');
  await expect(page.locator('#view')).toContainText('only this device’s players show');
  await expect(page.locator('.lbrow.me')).toBeVisible();
  const queued = await page.evaluate(() => JSON.parse(localStorage.getItem('pmlm.q')) || []);
  expect(queued.length).toBeGreaterThan(0);   // sent later, when the internet is back
  expect(errors.filter(e => !/Failed to fetch|fetch/.test(e))).toEqual([]);
});

test('dashboard: an admin sees the test data; others are told how to become one', async ({ page }) => {
  await fresh(page);
  await newPlayer(page, { name: 'Gia', grade: 3 });
  await practiseRound(page);
  await waitForDocs('events', e => e.type === 'round');
  await page.goto('/stats.html?emu=1');
  await page.locator('#signin').click();
  await expect(page.getByText('Not an admin yet')).toBeVisible();
  const uid = await page.locator('#uid').innerText();
  await putDoc(`admins/${uid}`, { ok: true });
  await page.reload();
  await expect(page.locator('.tile').first()).toContainText('1');
  await expect(page.getByText('Each child')).toBeVisible();
  await expect(page.locator('table').nth(1)).toContainText('3');
  await expect(page.getByText('Leaderboard')).toBeVisible();
});
