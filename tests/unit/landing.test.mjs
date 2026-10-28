// The landing page at pmlm.uk (src/landing.js): what each device gets before the page is drawn
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from './load.mjs';

const env = (extra = {}) => load(['move.js', 'landing.js'], Object.assign({
  TextEncoder, TextDecoder, CompressionStream, DecompressionStream, Blob, Response, btoa, atob, URL, URLSearchParams, setTimeout, clearTimeout, AbortController,
  PMLM_MOVE_TO: 'https://play.pmlm.uk/', PMLM_ENV: 'live', fetch: async () => { throw new Error('offline'); },
}, extra), ['Move', 'Landing']).Landing;
const at = url => { const u = new URL(url); return { hostname: u.hostname, pathname: u.pathname, search: u.search, hash: u.hash }; };
const store = (items = {}) => ({ getItem: k => (k in items ? items[k] : null), setItem: (k, v) => { items[k] = String(v); } });
const raw = JSON.parse(readFileSync(new URL('../fixtures/live-e9a72c3.json', import.meta.url), 'utf8')).state;
const played = () => ({ 'pmlm.v1': raw });
const plain = x => JSON.parse(JSON.stringify(x));
const browser = { standalone: false, ios: false }, iosApp = { standalone: true, ios: true }, androidApp = { standalone: true, ios: false };

test('a new visitor just sees the page', () => {
  const L = env();
  assert.equal(L.decide(at('https://pmlm.uk/'), store(), browser).act, 'show');
  assert.equal(L.decide(at('https://pmlm.uk/?src=ff3'), store(), browser).act, 'show', 'invite waves see the page too');
  assert.equal(L.decide(at('https://pmlm.uk/#grownups'), store(), browser).act, 'show');
});

test('a friend invite goes straight to the game, where the invite banner is', () => {
  const d = env().decide(at('https://pmlm.uk/?invite=K7PQ2M&src=ff1'), store(), browser);
  assert.deepEqual([d.act, d.url], ['forward', 'https://play.pmlm.uk/?invite=K7PQ2M&src=ff1']);
});

test('a device that played on pmlm.uk moves on with its progress, once', async () => {
  const L = env(), s = store(played());
  const d = L.decide(at('https://pmlm.uk/'), s, browser);
  assert.equal(d.act, 'move');
  assert.equal(d.t.url, 'https://play.pmlm.uk/');
  assert.equal(d.payload.state.profiles.length, JSON.parse(raw).profiles.length);
  // after the move the marker is set; the same progress isn't sent again and the browser shows the page
  s.setItem('pmlm.moved', JSON.stringify({ key: L.keyOf(d.payload.state), t: 1 }));
  assert.equal(L.decide(at('https://pmlm.uk/'), s, browser).act, 'show');
  assert.deepEqual(plain(L.decide(at('https://pmlm.uk/'), s, androidApp)), { act: 'forward', url: 'https://play.pmlm.uk/' }, 'an installed app goes on to the game');
  // an old tab kept playing here: the newer progress is sent again
  const newer = JSON.parse(raw); newer.updatedAt = (newer.updatedAt || 0) + 1000;
  s.setItem('pmlm.v1', JSON.stringify(newer));
  assert.equal(L.decide(at('https://pmlm.uk/'), s, browser).act, 'move');
});

test('iPhone and iPad Home Screen apps move by code, never by themselves', () => {
  const L = env();
  assert.equal(L.decide(at('https://pmlm.uk/'), store(played()), iosApp).act, 'code');
  assert.equal(L.decide(at('https://pmlm.uk/'), store(), iosApp).act, 'oldicon');
});

test('progress packed by an old GitHub tab passes straight through', () => {
  const d = env().decide(at('https://pmlm.uk/#move=z.abc_DEF-123'), store(played()), browser);
  assert.deepEqual([d.act, d.url], ['forward', 'https://play.pmlm.uk/#move=z.abc_DEF-123']);
});

test('the owner\'s debug and self-test bookmarks still open the game', () => {
  const L = env();
  assert.deepEqual(plain(L.decide(at('https://pmlm.uk/#debug'), store(played()), browser)), { act: 'forward', url: 'https://play.pmlm.uk/#debug' });
  assert.deepEqual(plain(L.decide(at('https://pmlm.uk/#selftest'), store(), browser)), { act: 'forward', url: 'https://play.pmlm.uk/#selftest' });
});

test('anywhere else the page only shows: previews, the new address, switched-off moving', () => {
  assert.equal(env().decide(at('https://pmlm-uk.pages.dev/welcome'), store(played()), browser).act, 'show');
  assert.equal(env().decide(at('https://play.pmlm.uk/welcome'), store(played()), browser).act, 'show');
  assert.equal(env({ PMLM_MOVE_TO: '' }).decide(at('https://pmlm.uk/'), store(played()), browser).act, 'show');
  assert.equal(env({ PMLM_ENV: 'preview', PMLM_MOVE_TO: '' }).PLAY, './', 'the preview copy plays next to it');
});

test('moving waits for the new address, and leaves the old copy in place', async () => {
  const s = store(played());
  const d = env().decide(at('https://pmlm.uk/'), s, browser);
  assert.equal(await env().move(d, s), false, 'unreachable: nothing happens');
  assert.equal(s.getItem('pmlm.moved'), null);
  assert.equal(s.getItem('pmlm.v1'), raw);
});
