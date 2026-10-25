// Shared helpers for the browser tests. The game is driven through its own buttons (data-act), like a child would.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';

export const ROOT = new URL('../../', import.meta.url).pathname;
export const STORE = 'pmlm.v1';
export const TEST_VAPID = 'BKxUv8zLZgJ0vNfH-bJLZcL5n0q4rRrZ2tK1Q6cOYf3bQ0r6pEoO8bWZ8sH2r1yX6fZk3QeYc8mF4tP1sW7nV9A';
const FS = 'http://127.0.0.1:8080/v1/projects/demo-pmlm/databases/(default)/documents';

// ---------- The version that is live now (to compare against) ----------
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
export function baseRef() {
  if (process.env.PMLM_BASE) return process.env.PMLM_BASE;
  let base;
  try { base = git('merge-base', 'HEAD', 'origin/main'); } catch (e) { base = git('rev-parse', 'main'); }
  // On main itself (after a merge) compare with the previous version of main
  const onMain = git('rev-parse', '--abbrev-ref', 'HEAD') === 'main' || process.env.GITHUB_REF_NAME === 'main';
  return onMain && base === git('rev-parse', 'HEAD') ? git('rev-parse', 'HEAD^1') : base;
}
// Writes tests/.cache/old/index.html (and its mock-Firebase sync test page); returns the URL path
export function oldBuild() {
  const dir = `${ROOT}tests/.cache/old`, ref = baseRef();
  mkdirSync(dir, { recursive: true });
  if (!existsSync(`${dir}/${ref}.html`)) {
    writeFileSync(`${dir}/${ref}.html`, execFileSync('git', ['show', `${ref}:index.html`], { cwd: ROOT, maxBuffer: 64 << 20 }));
    execFileSync('python3', [`${ROOT}tools/make-synctest.py`, '--src', `${dir}/${ref}.html`, '--out', `${dir}/${ref}-synctest.html`]);
  }
  return { ref, page: `/tests/.cache/old/${ref}.html`, synctest: `/tests/.cache/old/${ref}-synctest.html` };
}

// ---------- Firestore emulator ----------
const dec = v => ('stringValue' in v ? v.stringValue : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'booleanValue' in v ? v.booleanValue
  : 'arrayValue' in v ? (v.arrayValue.values || []).map(dec) : 'mapValue' in v ? decFields(v.mapValue.fields) : null);
const decFields = f => Object.fromEntries(Object.entries(f || {}).map(([k, v]) => [k, dec(v)]));
const enc = v => (typeof v === 'string' ? { stringValue: v } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : v && typeof v === 'object' ? { mapValue: { fields: encFields(v) } } : { nullValue: null });
const encFields = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)]));

export async function clearEmulators() {
  await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-pmlm/databases/(default)/documents', { method: 'DELETE' });
  await fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-pmlm/accounts', { method: 'DELETE' });
}
// "Bearer owner" reads and writes past the security rules (emulator only)
export async function docs(col) {
  const r = await fetch(`${FS}/${col}?pageSize=300`, { headers: { Authorization: 'Bearer owner' } });
  const j = await r.json();
  return (j.documents || []).map(d => Object.assign({ _id: d.name.split('/').pop() }, decFields(d.fields)));
}
export async function putDoc(path, data) {
  const r = await fetch(`${FS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: encFields(data) }) });
  if (!r.ok) throw new Error(`putDoc ${path}: ${r.status}`);
}
// Waits until a collection has documents matching fn (the game sends them a moment after the action)
export async function waitForDocs(col, fn = () => true, n = 1, ms = 15000) {
  const end = Date.now() + ms;
  for (;;) {
    const list = (await docs(col)).filter(fn);
    if (list.length >= n || Date.now() > end) return list;
    await new Promise(r => setTimeout(r, 300));
  }
}

// ---------- Driving the game ----------
export const act = (page, name, extra = '') => page.locator(`[data-act="${name}"]${extra}`).first().click();
// The game saves a quarter of a second after a change
export const state = async page => { await page.waitForTimeout(450); return page.evaluate(k => JSON.parse(localStorage.getItem(k)), STORE); };
export const tab = (page, id) => page.locator(`#tabs [data-act="tab"][data-id="${id}"]`).click();

export async function newPlayer(page, { name = 'Test Kid', grade = 3, closeQuickStart = true } = {}) {
  await page.locator('[data-act="newplayer"]').first().click();
  await page.fill('#np-name', name);
  await page.locator(`[data-act="np"][data-k="grade"][data-v="${grade}"]`).click();
  await page.locator('[data-act="createplayer"]').click();
  await page.locator('#tabs').waitFor();
  if (closeQuickStart) {
    // The grown-up quick start (new versions only) appears a moment after the first player
    await page.waitForTimeout(1600);
    if (await page.locator('.sheet [data-act="qsgo"]').count()) await page.locator('.sheet [data-act="close"]').last().click();
  }
}

// Type a 4-digit PIN with the keyboard (works for creating, confirming and entering it)
export async function typePin(page, pin = '1234') { for (const k of pin) await page.keyboard.press(k); }
export async function openParents(page, pin = '1234') {
  await tab(page, 'parent');
  for (let i = 0; i < 3 && !(await page.locator('[data-act="savewishes"]').count()); i++) { await typePin(page, pin); await page.waitForTimeout(150); }
  await page.locator('[data-act="savewishes"]').waitFor();
}

// Play the round on screen to the end: type 7 (or pick the first choice) until the results show
export async function playRound(page) {
  await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    for (let step = 0; step < 400; step++) {
      if (document.querySelector('.brainbig') || document.querySelector('[data-act="practise"].pulse')) return;
      const next = document.querySelector('[data-act="next"]');
      if (next) { next.click(); await wait(60); continue; }
      const choice = [...document.querySelectorAll('.choice')].find(b => !b.disabled);
      if (choice) { choice.click(); await wait(60); continue; }
      const k7 = document.querySelector('.k[data-k="7"]'), ok = document.querySelector('.k[data-k="ok"]');
      if (k7 && !k7.disabled) {
        // fraction and coordinate questions have more than one box
        const boxes = document.querySelectorAll('.ansbox');
        for (let b = 0; b < boxes.length; b++) { k7.click(); if (boxes.length > 1) document.querySelector('.k[data-k="next"]').click(); }
        ok.click(); await wait(60); continue;
      }
      await wait(250);
    }
    throw new Error('the round did not finish');
  });
  // close any celebrations (skill mastered, wish unlocked...)
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(1100);
    const yay = page.locator('.celebrate button');
    if (!(await yay.count())) break;
    await yay.first().click();
  }
}
export async function home(page) { await act(page, 'home'); await page.locator('#tabs').waitFor(); }

// Errors on the page fail the test
export function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_CONNECTION_REFUSED|Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });
  return errors;
}
