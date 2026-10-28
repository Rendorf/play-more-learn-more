import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from './load.mjs';

const env = (extra = {}) => load(['move.js'], Object.assign({
  TextEncoder, TextDecoder, CompressionStream, DecompressionStream, Blob, Response, btoa, atob, URL, URLSearchParams, setTimeout, clearTimeout, AbortController,
  PMLM_MOVE_TO: 'https://play.pmlm.uk/', PMLM_ENV: 'live', fetch: async () => { throw new Error('offline'); },
}, extra), ['Move']).Move;
const at = url => { const u = new URL(url); return { hostname: u.hostname, pathname: u.pathname, search: u.search, hash: u.hash }; };
const plain = x => JSON.parse(JSON.stringify(x));
const fx_state = JSON.parse(readFileSync(new URL('../fixtures/live-e9a72c3.json', import.meta.url), 'utf8')).state;
const fixture = JSON.parse(fx_state);

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

test('only the old live addresses send devices on, keeping the invite and src parts of the link', () => {
  const Move = env(), P = 'https://play.pmlm.uk/';
  assert.equal(Move.HOST, 'play.pmlm.uk');
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/')).url, P);
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/index.html?src=ff1')).url, P + '?src=ff1');
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/?invite=ABC123')).url, P + '?invite=ABC123');
  assert.equal(Move.target(at('https://pmlm.uk/')).url, P, 'pmlm.uk is an old address now');
  assert.equal(Move.target(at('https://www.pmlm.uk/index.html?src=ff2')).url, P + '?src=ff2');
  assert.equal(Move.target(at('https://pmlm.uk/?stay=1&invite=XY')).url, P + '?invite=XY', 'the keep-playing-here switch is not passed on');
  assert.equal(Move.target(at('https://play.pmlm.uk/')), null, 'the new address stays');
  assert.equal(Move.target(at('https://play.pmlm.uk/?moveto=https://evil.example/')), null);
  assert.equal(Move.target(at('https://pmlm-uk.pages.dev/')), null, 'Cloudflare preview copies stay');
  assert.equal(Move.target(at('https://rendorf.github.io/pmlm-preview/')), null, 'the preview stays');
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more-other/')), null);
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/#selftest')), null);
  assert.equal(Move.target(at('https://pmlm.uk/#debug')), null);
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/?debug=1')), null);
  assert.equal(Move.target(at('https://rendorf.github.io/play-more-learn-more/?moveto=https://evil.example/')).url, P, 'the test switch only works on a local server');
  assert.deepEqual(plain(Move.target(at('http://127.0.0.1:8766/index.html?moveto=http://localhost:8766/'))), { url: 'http://localhost:8766/', test: true });
  assert.equal(env({ PMLM_ENV: 'preview' }).target(at('https://rendorf.github.io/play-more-learn-more/')), null, 'the preview build never moves');
  assert.equal(env({ PMLM_MOVE_TO: '' }).target(at('https://rendorf.github.io/play-more-learn-more/')), null, 'switched off');
});

// A stand-in for localStorage
const store = (items = {}) => ({ getItem: k => (k in items ? items[k] : null) });

test('what a device takes along is read straight from storage, sign-ins left behind', () => {
  const Move = env();
  assert.deepEqual(plain(Move.payload(store({ 'pmlm.v1': fx_state, 'pmlm.sync': '1', 'pmlm.push': '{"on":true,"hour":18}', 'pmlm.anon': '{"uid":"x"}' }))),
    { v: 1, state: fixture, family: true, push: { hour: 18 } });
  assert.deepEqual(plain(Move.payload(store({ 'pmlm.v1': fx_state, 'pmlm.push': '{"on":false,"hour":18}' }))), { v: 1, state: fixture, family: false, push: null });
  assert.equal(Move.payload(store()), null, 'a fresh device');
  assert.equal(Move.payload(store({ 'pmlm.v1': JSON.stringify({ v: 1, profiles: [] }) })), null, 'no players yet');
  assert.equal(Move.payload(store({ 'pmlm.v1': '{not json' })), null);
  assert.equal(Move.payload({ getItem: () => { throw new Error('blocked'); } }), null, 'storage blocked');
  const preview = env({ PMLM_ENV: 'preview' });
  assert.equal(preview.payload(store({ 'pmlm.v1': fx_state })), null, 'the preview copy reads its own keys');
  assert.equal(preview.payload(store({ 'pmlm-preview.v1': fx_state })).state.profiles.length, fixture.profiles.length);
});

test('devices move only when the new address really serves the game', async () => {
  const t = { url: 'https://play.pmlm.uk/', test: false };
  const answer = body => env({ fetch: async () => ({ ok: true, json: async () => body }) });
  assert.equal(await answer({ app: 'play-more-learn-more', receives: 1 }).ready(t), true);
  assert.equal(await answer({ app: 'something-else' }).ready(t), false, 'a parked or different site');
  assert.equal(await env({ fetch: async () => ({ ok: false, json: async () => ({}) }) }).ready(t), false, 'not found');
  assert.equal(await env().ready(t), false, 'unreachable');
});
