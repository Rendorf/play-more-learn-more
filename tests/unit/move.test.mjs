import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from './load.mjs';

const env = (extra = {}) => load(['move.js'], Object.assign({
  TextEncoder, TextDecoder, CompressionStream, DecompressionStream, Blob, Response, btoa, atob, URL, URLSearchParams, setTimeout, clearTimeout, AbortController,
  PMLM_MOVE_TO: 'https://pmlm.uk/', PMLM_ENV: 'live', fetch: async () => { throw new Error('offline'); },
}, extra), ['Move']).Move;
const at = url => { const u = new URL(url); return { hostname: u.hostname, pathname: u.pathname, search: u.search, hash: u.hash }; };
const plain = x => JSON.parse(JSON.stringify(x));
const fixture = JSON.parse(JSON.parse(readFileSync(new URL('../fixtures/live-e9a72c3.json', import.meta.url), 'utf8')).state);

test('progress survives packing into the link, compressed or not', async () => {
  const Move = env(), payload = { v: 1, state: fixture, family: true, push: { hour: 17 } };
  const code = await Move.encode(payload);
  assert.match(code, /^z\.[A-Za-z0-9_-]+$/, 'only characters that are safe in a link');
  assert.deepEqual(plain(await Move.decode(code)), payload);
  assert.ok(code.length < JSON.stringify(payload).length / 2, 'compressed to well under half');
  const old = env({ CompressionStream: undefined });   // a browser from before 2023
  const raw = await old.encode(payload);
  assert.match(raw, /^j\./);
  assert.deepEqual(plain(await Move.decode(raw)), payload);
});

test('only the old live address sends devices on, keeping the invite and src parts of the link', () => {
  const Move = env();
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/')).url, 'https://pmlm.uk/');
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/index.html?src=ff1')).url, 'https://pmlm.uk/?src=ff1');
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/?invite=ABC123')).url, 'https://pmlm.uk/?invite=ABC123');
  assert.equal(Move.target(at('https://pmlm.uk/')), null, 'the new address stays');
  assert.equal(Move.target(at('https://rendorf.github.io/pmlm-preview/')), null, 'the preview stays');
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more-other/')), null);
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/#selftest')), null);
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/?debug=1')), null);
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/?moveto=https://evil.example/')).url, 'https://pmlm.uk/', 'the test switch only works on a local server');
  assert.deepEqual(plain(Move.target(at('http://127.0.0.1:8766/index.html?moveto=http://localhost:8766/'))), { url: 'http://localhost:8766/', test: true });
  assert.equal(env({ PMLM_ENV: 'preview' }).target(at('https://rendorf.github.io/play-more-learn-more/')), null, 'the preview build never moves');
  assert.equal(env({ PMLM_MOVE_TO: '' }).target(at('https://rendorf.github.io/play-more-learn-more/')), null, 'switched off');
});

test('devices move only when the new address really serves the game', async () => {
  const t = { url: 'https://pmlm.uk/', test: false };
  const answer = body => env({ fetch: async () => ({ ok: true, json: async () => body }) });
  assert.equal(await answer({ app: 'play-more-learn-more', receives: 1 }).ready(t), true);
  assert.equal(await answer({ app: 'something-else' }).ready(t), false, 'a parked or different site');
  assert.equal(await env({ fetch: async () => ({ ok: false, json: async () => ({}) }) }).ready(t), false, 'not found');
  assert.equal(await env().ready(t), false, 'unreachable');
});
