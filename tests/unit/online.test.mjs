import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { load } from './load.mjs';

// A pretend browser page at the given address
function page(url, config, extra = {}) {
  const store = {};
  const u = new URL(url);
  const window = Object.assign({ matchMedia: () => ({ matches: false }) }, extra.window);
  return load(['board.js', 'online.js'], {
    window, location: { search: u.search, hash: u.hash, hostname: u.hostname, protocol: u.protocol },
    navigator: { userAgent: 'Mozilla/5.0 (iPhone)', maxTouchPoints: 5, onLine: true },
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    matchMedia: window.matchMedia, crypto: webcrypto, addEventListener: () => {}, atob, setTimeout, clearTimeout, fetch: async () => { throw new Error('offline'); },
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
