import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

// Google Analytics runs on the live addresses only, remembers a grown-up's cookie choice for both of them, and sends
// game events without ids, names or typed text
const { Analytics: A } = load(['analytics.js'], {}, ['Analytics']);
const at = (url, id = 'G-TEST', artifact = false) => { const u = new URL(url); return A.allowed({ hostname: u.hostname, search: u.search, hash: u.hash }, id, artifact); };

test('runs on pmlm.uk and play.pmlm.uk, nowhere else unless a test asks', () => {
  assert.equal(at('https://pmlm.uk/'), true);
  assert.equal(at('https://www.pmlm.uk/'), true);
  assert.equal(at('https://play.pmlm.uk/'), true);
  assert.equal(at('https://rendorf.github.io/play-more-learn-more/'), false, 'the old address only moves devices on');
  assert.equal(at('https://rendorf.github.io/pmlm-preview/'), false);
  assert.equal(at('http://localhost:8765/index.html'), false);
  assert.equal(at('https://notpmlm.uk/'), false);
  assert.equal(at('http://127.0.0.1:8767/index.html?gatest=1'), true);
  assert.equal(at('https://play.pmlm.uk/#selftest'), false, 'the owner\'s self-test');
  assert.equal(at('https://play.pmlm.uk/#debug'), false);
  assert.equal(at('https://play.pmlm.uk/', ''), false, 'no id (the preview)');
  assert.equal(at('https://play.pmlm.uk/', 'G-TEST', true), false, 'the claude.ai copy');
});

test('one cookie choice for the landing page and the game', () => {
  assert.equal(A.cookieDomain('pmlm.uk'), '.pmlm.uk');
  assert.equal(A.cookieDomain('play.pmlm.uk'), '.pmlm.uk');
  assert.equal(A.cookieDomain('127.0.0.1'), '');
  assert.equal(A.choiceIn(''), null, 'not asked yet');
  assert.equal(A.choiceIn('a=1; pmlm_analytics=granted; _ga=GA1.1.2'), 'granted');
  assert.equal(A.choiceIn('pmlm_analytics=denied'), 'denied');
  assert.equal(A.choiceIn('xpmlm_analytics=granted'), null);
});

test('game events keep only the listed fields: never ids, names or error text', () => {
  const round = A.event('round', { p: 'pabc123', d: 'dxyz', g: 3, sk: 'g3u2s1', mode: 'practice', n: 10, ok: 8, secs: 95, m: 1, name: 'Kid A' });
  assert.deepEqual(JSON.parse(JSON.stringify(round)), { name: 'round_done', params: { grade: 3, skill: 'g3u2s1', mode: 'practice', answered: 10, correct: 8, seconds: 95, mastered: 1 } });
  const problem = A.event('problem', { g: 4, sk: 's1', n: 2, msg: 'TypeError: boom at line 3' });
  assert.deepEqual(JSON.parse(JSON.stringify(problem.params)), { grade: 4, skill: 's1', level: 2 });
  assert.equal(A.event('invite', { mode: 'share' }).name, 'invite');
  assert.equal(A.event('unknown', { g: 1 }), null, 'unlisted events are dropped');
  for (const [type, [name, fields]] of Object.entries(A.EVENTS)) {
    assert.match(name, /^[a-z_]{3,40}$/, `${type} has a valid Analytics event name`);
    for (const k of ['p', 'd', 'msg', 'src', 'name', 'text']) assert.ok(!(k in fields), `${type} never sends ${k}`);
  }
});
