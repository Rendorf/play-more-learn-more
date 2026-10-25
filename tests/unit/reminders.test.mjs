import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { PMLM_REMINDERS: R } = load(['reminders.js'], {}, ['PMLM_REMINDERS']);
// Baku is UTC+4: 13:05 UTC is 17:05 there
const at = (day, utcHour) => Date.parse(`${day}T${String(utcHour).padStart(2, '0')}:05:00Z`);
const base = o => Object.assign({ owner: 'devA', sub: { endpoint: 'https://x' }, tz: 'Asia/Baku', off: 240, hour: 17, kids: [{ av: '🦊', str: 3, last: '2026-10-24', wish: -1 }], t: 0 }, o);

test('sends at the chosen local hour (or the hour after, if the job ran late), once a day', () => {
  assert.equal(R.plan(base(), at('2026-10-25', 13)).send, true);
  assert.equal(R.plan(base(), at('2026-10-25', 14)).send, true, 'an hour late is still fine');
  assert.equal(R.plan(base(), at('2026-10-25', 12)).reason, 'not the chosen hour');
  assert.equal(R.plan(base(), at('2026-10-25', 15)).reason, 'not the chosen hour');
  assert.equal(R.plan(base({ lastSent: '2026-10-25' }), at('2026-10-25', 13)).reason, 'already sent today');
});

test('never reminds a child who already played today', () => {
  assert.equal(R.plan(base({ kids: [{ av: '🦊', str: 4, last: '2026-10-25' }] }), at('2026-10-25', 13)).reason, 'played today');
  const two = base({ kids: [{ av: '🦊', last: '2026-10-20' }, { av: '🐼', last: '2026-10-25' }] });
  assert.equal(R.plan(two, at('2026-10-25', 13)).reason, 'played today', 'one child on the device played');
});

test('backs off like Duolingo: daily for 3 days, then every 3rd day, then stops after 14', () => {
  const sendsOn = [];
  for (let since = 1; since <= 20; since++) {
    const last = new Date(Date.UTC(2026, 9, 25 - since)).toISOString().slice(0, 10);
    if (R.plan(base({ kids: [{ av: '🦊', str: 1, last }] }), at('2026-10-25', 13)).send) sendsOn.push(since);
  }
  assert.deepEqual(sendsOn, [1, 2, 3, 6, 9, 12]);
});

test('picks the message for the situation', () => {
  const streak = R.plan(base(), at('2026-10-25', 13));
  assert.equal(streak.cat, 'streak');
  assert.match(streak.body + streak.title, /3/);
  const wish = R.plan(base({ kids: [{ av: '🦊', str: 1, last: '2026-10-24', wish: 8 }] }), at('2026-10-25', 13));
  assert.equal(wish.cat, 'wish');
  assert.match(wish.body + wish.title, /8%/);
  const comeback = R.plan(base({ kids: [{ av: '🦊', str: 5, last: '2026-10-22' }] }), at('2026-10-25', 13));
  assert.equal(comeback.cat, 'comeback', 'a lost streak is not mentioned');
  const frozen = R.plan(base({ kids: [{ av: '🦊', str: 6, frz: 2, last: '2026-10-22' }] }), at('2026-10-25', 13));
  assert.equal(frozen.cat, 'streak', 'freezes still cover the missed days, so the streak can be saved');
  const plain = R.plan(base({ kids: [{ av: '🦊', str: 1, last: '2026-10-24' }] }), at('2026-10-25', 13));
  assert.ok(['growth', 'playful'].includes(plain.cat));
});

test('never repeats the last message', () => {
  const first = R.plan(base(), at('2026-10-25', 13));
  const again = R.plan(base({ lastMsg: first.id }), at('2026-10-25', 13));
  assert.notEqual(again.id, first.id);
});

test('a new subscriber who has not played yet still gets reminded', () => {
  const p = R.plan(base({ kids: [{ av: '🦊', str: 0, last: '' }], t: at('2026-10-24', 9) }), at('2026-10-25', 13));
  assert.equal(p.send, true);
});

test('an unknown time zone falls back to the offset', () => {
  assert.equal(R.plan(base({ tz: 'Mars/Olympus' }), at('2026-10-25', 13)).send, true);
});

test('every message is short and fully filled in', () => {
  for (const [cat, list] of Object.entries(R.M)) for (const [t, b] of list) {
    assert.ok(t.length <= 40, `${cat} title too long: ${t}`);
    assert.ok(b.length <= 110, `${cat} body too long: ${b}`);
  }
  for (let i = 0; i < 40; i++) {
    const p = R.plan(base({ kids: [{ av: '🦊', str: 2 + i, last: '2026-10-24', wish: i % 3 ? -1 : 12 }], owner: 'd' + i }), at('2026-10-25', 13));
    assert.doesNotMatch(p.title + p.body, /[{}]/);
  }
  assert.equal(R.daily('2026-10-25'), R.daily('2026-10-25'));
});
