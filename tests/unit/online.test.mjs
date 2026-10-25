import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { load } from './load.mjs';

// A pretend browser page at the given address
function page(url, config, extra = {}) {
  const store = extra.store || {};
  const u = new URL(url);
  const window = Object.assign({ matchMedia: () => ({ matches: false }) }, extra.window);
  return load(['board.js', 'online.js'], {
    window, location: { search: u.search, hash: u.hash, hostname: u.hostname, protocol: u.protocol },
    navigator: { userAgent: 'Mozilla/5.0 (iPhone)', maxTouchPoints: 5, onLine: true },
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    matchMedia: window.matchMedia, crypto: webcrypto, addEventListener: () => {}, atob, setTimeout, clearTimeout, fetch: extra.fetch || (async () => { throw new Error('offline'); }),
    PMLM_FIREBASE: config, PMLM_FEATURES: extra.features, PMLM_ENV: extra.env,
  }, ['Online']).Online;
}
const CFG = { apiKey: 'k', projectId: 'playmorelearnmore' };

test('Firestore values round-trip through the REST format', () => {
  const { codec } = page('https://rendorf.github.io/play-more-learn-more/', CFG);
  const v = { s: 'hi', i: 42, f: 1.5, b: true, n: null, a: [1, 'x', { k: 2 }], m: { deep: { er: 'yes' } } };
  const f = codec.encFields(v);
  const plain = x => JSON.parse(JSON.stringify(x));
  assert.deepEqual(plain(f.i), { integerValue: '42' });
  assert.deepEqual(plain(f.f), { doubleValue: 1.5 });
  assert.deepEqual(JSON.parse(JSON.stringify(codec.decFields(f))), v);
});

test('online extras are on for the live site and off where they must not run', () => {
  assert.equal(page('https://rendorf.github.io/play-more-learn-more/', CFG).enabled, true);
  assert.equal(page('http://localhost:8765/index.html', CFG).enabled, false, 'local preview');
  assert.equal(page('http://127.0.0.1:8766/index.html?emu=1', CFG).enabled, true, 'local preview with the emulators');
  assert.equal(page('https://rendorf.github.io/play-more-learn-more/#selftest', CFG).enabled, false);
  assert.equal(page('https://rendorf.github.io/play-more-learn-more/?debug=1', CFG).enabled, false);
  assert.equal(page('https://rendorf.github.io/play-more-learn-more/', null).enabled, false, 'no Firebase project');
  assert.equal(page('https://claude.ai/x', CFG, { window: { claude: { use: () => {} } } }).enabled, false, 'claude.ai artifact');
});

test('feature switches turn single features off', () => {
  const o = page('https://rendorf.github.io/play-more-learn-more/', CFG, { features: { leaderboard: false } });
  assert.equal(o.has('leaderboard'), false);
  assert.equal(o.has('stats'), true);
});

test('the preview copy keeps its own storage keys', () => {
  assert.equal(page('https://rendorf.github.io/play-more-learn-more/', CFG).KEY, 'pmlm.');
  assert.equal(page('https://rendorf.github.io/pmlm-preview/', CFG, { env: 'preview' }).KEY, 'pmlm-preview.');
});

test('reminders need the Home Screen on iPhone', () => {
  const o = page('https://rendorf.github.io/play-more-learn-more/', CFG);
  assert.equal(o.install.platform, 'ios');
  assert.equal(o.push.needsHomeScreen, true);
  assert.equal(o.push.configured, false, 'no public key yet');
});

// ---------- Invite a friend ----------
const LIVE = 'https://rendorf.github.io/play-more-learn-more/';
// A pretend Firebase: answers sign-up and records every Firestore call; reply(method, path) can refuse one
function server(reply = () => 200) {
  const calls = [];
  const fetch = async (url, opts = {}) => {
    if (url.includes('accounts:signUp')) return { ok: true, status: 200, json: async () => ({ idToken: 'tok', localId: 'friendUid', refreshToken: 'r', expiresIn: '3600' }) };
    const u = new URL(url), path = decodeURIComponent(u.pathname.split('/documents/')[1] || ''), method = opts.method || 'GET';
    if (reply === 'offline') throw new Error('offline');
    const status = reply(method, path, u.search);
    calls.push({ method, path, query: decodeURIComponent(u.search), body: opts.body ? JSON.parse(opts.body).fields : null, status });
    return { ok: status < 300, status, json: async () => (method === 'GET' ? { documents: [] } : {}) };
  };
  return { calls, fetch };
}
const idle = async () => { for (let i = 0; i < 20; i++) await new Promise(r => setTimeout(r, 0)); };

test('invite codes: six clear letters, a clash is retried, one code per player on this device', async () => {
  const srv = server((m, path) => (path.startsWith('invites/') && srv.calls.filter(c => c.path.startsWith('invites/')).length === 0 ? 403 : 200));
  const o = page(LIVE, CFG, { fetch: srv.fetch });
  const code = await o.invite.code('p1');
  assert.match(code, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
  const made = srv.calls.filter(c => c.path.startsWith('invites/'));
  assert.equal(made.length, 2, 'the first code clashed, the second was kept');
  assert.ok(made.every(c => c.query.includes('currentDocument.exists=false')));
  assert.equal(made[1].body.owner.stringValue, 'friendUid');
  assert.equal(made[1].body.pid.stringValue, 'p1');
  assert.equal(o.invite.mine('p1'), code);
  assert.equal(await o.invite.code('p1'), code);
  assert.equal(srv.calls.length, 2, 'no new code the second time');
  assert.equal(o.invite.mine('p2'), null);
});

test('an invited device is counted once, then reports joining and playing', async () => {
  const store = {}, srv = server();
  const o = page(LIVE, CFG, { fetch: srv.fetch, store });
  assert.equal(o.invite.land('K7PQ2M'), true);
  await idle();
  assert.deepEqual(srv.calls.map(c => `${c.method} ${c.path}`), ['PATCH referred/friendUid', 'PATCH invites/K7PQ2M/friends/friendUid']);
  assert.ok(srv.calls[0].query.includes('currentDocument.exists=false'));
  assert.equal(JSON.parse(store['pmlm.src']), 'invite');
  o.invite.step('joined', { name: 'Leyla Long Name Here', joined: 5 });
  await idle();
  const joined = srv.calls[2];
  assert.equal(joined.body.name.stringValue, 'Leyla Long Name ', 'names are cut to 16 characters');
  assert.match(joined.query, /fieldPaths=joined/);
  o.invite.step('played', { played: 9 });
  await idle();
  assert.match(srv.calls[3].query, /fieldPaths=played/);
  assert.equal(srv.calls.filter(c => c.path.startsWith('referred/')).length, 1, 'counted only once');
  assert.equal(o.invite.ref.stage, 'played');
  assert.equal(o.invite.land('ZZZZZZ'), false, 'a second invite is not taken');
});

test('a refused invite stops quietly; no network keeps it for later', async () => {
  const srv = server(m => 403), o = page(LIVE, CFG, { fetch: srv.fetch });
  o.invite.land('K7PQ2M');
  await idle();
  assert.equal(o.invite.ref, null, 'its own link, a bad code or a device already counted');
  const n = srv.calls.length;
  o.invite.step('joined', { name: 'Ann', joined: 1 });
  await idle();
  assert.equal(srv.calls.length, n, 'nothing more is sent');

  const off = server('offline'), o2 = page(LIVE, CFG, { fetch: off.fetch });
  o2.invite.land('K7PQ2M');
  await idle();
  assert.equal(o2.invite.ref.code, 'K7PQ2M', 'kept while offline');
});

test('land: only a well-formed code, and an earlier ?src= stays', async () => {
  const store = { 'pmlm.src': JSON.stringify('ff1') }, o = page(LIVE, CFG, { fetch: server().fetch, store });
  assert.equal(o.invite.land('bad'), false);
  assert.equal(o.invite.land('K7PQ2M'), true);
  await idle();
  assert.equal(JSON.parse(store['pmlm.src']), 'ff1');
});

test('collect is true only when the server accepts this very call', async () => {
  const ok = page(LIVE, CFG, { fetch: server().fetch });
  assert.equal(await ok.invite.collect('K7PQ2M', 'f1'), true);
  const no = page(LIVE, CFG, { fetch: server(() => 403).fetch });
  assert.equal(await no.invite.collect('K7PQ2M', 'f1'), false, 'already paid or not played yet');
  const off = page(LIVE, CFG, { fetch: server('offline').fetch });
  await assert.rejects(off.invite.collect('K7PQ2M', 'f1'), 'no network: try again later');
});

test('invites switch off with PMLM_FEATURES and on the local preview', async () => {
  const o = page(LIVE, CFG, { features: { invites: false }, fetch: server().fetch });
  assert.equal(o.has('invites'), false);
  assert.equal(o.invite.land('K7PQ2M'), false);
  await assert.rejects(o.invite.code('p1'));
  assert.equal(page('http://localhost:8765/index.html', CFG).has('invites'), false);
});
