import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { Board } = load(['board.js'], {}, ['Board']);
const d = (y, m, day) => new Date(y, m - 1, day);

test('nicknames are stable, kid-safe and short enough for the leaderboard rules', () => {
  assert.equal(Board.nick('pabc123', 0), Board.nick('pabc123', 0));
  assert.notEqual(Board.nick('pabc123', 0), Board.nick('pabc123', 1));
  assert.match(Board.nick('pxyz', 3), /^[A-Z][a-z]+ [A-Z][a-z]+ \d{2}$/);
  const longest = Math.max(...Board.ADJ.map(a => a.length)) + Math.max(...Board.ANIMALS.map(a => a.length)) + 5;
  assert.ok(longest <= 24, `longest nickname is ${longest} characters`);
  const seen = new Set(Array.from({ length: 500 }, (_, i) => Board.nick('p' + i, 0)));
  assert.ok(seen.size > 490, 'nicknames rarely repeat');
});

test('ISO week ids start on Monday and handle the turn of the year', () => {
  assert.equal(Board.weekId(d(2026, 10, 25)), '2026-W43');   // Sunday
  assert.equal(Board.weekId(d(2026, 10, 26)), '2026-W44');   // Monday
  assert.equal(Board.weekId(d(2026, 1, 1)), '2026-W01');
  assert.equal(Board.weekId(d(2027, 1, 1)), '2026-W53');
  assert.equal(Board.weekId(d(2024, 12, 30)), '2025-W01');
  assert.equal(Board.dayOf(d(2026, 3, 7)), '2026-03-07');
});

test('active time is capped at 90 seconds per answered question', () => {
  assert.equal(Board.activeSecs(10 * 60000, 10), 600);
  assert.equal(Board.activeSecs(60 * 60000, 2), 180, 'an hour with the tablet left open counts as 3 minutes');
  assert.equal(Board.activeSecs(5000, 0), 0);
});

test('streaks count while alive: goal met today or yesterday, or missed days covered by freezes', () => {
  assert.equal(Board.streakAlive('2026-10-25', '2026-10-25', 0), true);
  assert.equal(Board.streakAlive('2026-10-24', '2026-10-25', 0), true);
  assert.equal(Board.streakAlive('2026-10-23', '2026-10-25', 0), false);
  assert.equal(Board.streakAlive('2026-10-23', '2026-10-25', 1), true, 'one freeze covers one missed day');
  assert.equal(Board.streakAlive('2026-10-21', '2026-10-25', 2), false);
  assert.equal(Board.streakAlive('', '2026-10-25', 2), false);
});

const opts = o => Object.assign({ period: 'all', metric: 'pts', grade: 0, week: '2026-W43', today: '2026-10-25' }, o);
const doc = o => Object.assign({ pid: 'p', g: 3, pts: 0, min: 0, mst: 0, str: 0, day: '2026-10-25', q: 0, acc: 0, wk: '2026-W43', wpts: 0, wmin: 0, wq: 0, wmst: 0, t: 1 }, o);

test('one row per player: the newest document wins, a hidden one removes the player', () => {
  const docs = [doc({ pid: 'a', pts: 100, t: 1 }), doc({ pid: 'a', pts: 300, t: 5 }), doc({ pid: 'b', pts: 200, t: 2 }), doc({ pid: 'b', hid: true, t: 9 })];
  const rows = Board.rows(docs, opts());
  assert.deepEqual(JSON.parse(JSON.stringify(rows.map(r => [r.pid, r.value]))), [['a', 300]]);
});

test('ranking by each metric, this week or all time, with ties sharing a rank', () => {
  const docs = [
    doc({ pid: 'a', pts: 900, wpts: 100, min: 50, wmin: 5, mst: 4, wmst: 1, q: 80, wq: 10, acc: 60, str: 2 }),
    doc({ pid: 'b', pts: 500, wpts: 400, min: 20, wmin: 20, mst: 9, wmst: 2, q: 40, wq: 40, acc: 95, str: 6 }),
    doc({ pid: 'c', pts: 500, wpts: 0, min: 70, wmin: 0, mst: 1, q: 300, acc: 75, str: 1, wk: '2026-W42', day: '2026-10-20' }),
  ];
  const order = o => Board.rows(docs, opts(o)).map(r => `${r.rank}${r.pid}`).join(' ');
  assert.equal(order({ metric: 'pts' }), '1a 2b 2c');
  assert.equal(order({ metric: 'pts', period: 'week' }), '1b 2a', 'only players who played this week');
  assert.equal(order({ metric: 'min' }), '1c 2a 3b');
  assert.equal(order({ metric: 'mst', period: 'week' }), '1b 2a');
  assert.equal(order({ metric: 'q' }), '1c 2a 3b');
  assert.equal(order({ metric: 'acc' }), '1c 2a', 'first-try % needs at least 50 questions');
  assert.equal(order({ metric: 'str' }), '1b 2a', 'an old streak does not count');
  assert.equal(order({ grade: 4 }), '');
  assert.equal(order({ grade: 3, metric: 'pts' }), '1a 2b 2c');
});

// The crowd: made-up players, the same on every device on the same day, never leading a view
const TODAY = '2026-11-04', WEEK = Board.weekId(d(2026, 11, 4));
const crowdOf = (B, today) => B.crowd({ today, avatars: ['🦊', '🐼', '🐯'], hats: ['🧢', '🎀'] });
const family = [
  doc({ pid: 'pa', g: 3, pts: 52000, wpts: 9000, min: 300, wmin: 60, mst: 12, wmst: 3, q: 400, wq: 80, acc: 81, str: 4, day: TODAY, wk: WEEK }),
  doc({ pid: 'pb', g: 3, pts: 41000, wpts: 3000, min: 250, wmin: 20, mst: 8, wmst: 1, q: 300, wq: 30, acc: 74, str: 2, day: TODAY, wk: WEEK }),
  doc({ pid: 'pc', g: 6, pts: 70000, wpts: 12000, min: 420, wmin: 90, mst: 15, wmst: 4, q: 500, wq: 100, acc: 88, str: 3, day: TODAY, wk: WEEK }),
];
const views = () => Object.keys(Board.METRICS).flatMap(metric => ['week', 'all'].flatMap(period => [0, ...Array.from({ length: 9 }, (_, i) => i + 1)].map(grade => ({ metric, period, grade }))));

test('the crowd is the same on every device on a day, and 2 to 4 more join each day', () => {
  const other = load(['board.js'], {}, ['Board']).Board;   // a second device: no shared memory
  const a = crowdOf(Board, TODAY), b = crowdOf(other, TODAY);
  assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
  const next = crowdOf(Board, '2026-11-05'), ids = new Set(next.map(x => x.pid));
  assert.ok(a.every(x => ids.has(x.pid)), 'yesterday\'s players are still there');
  assert.ok(next.length - a.length >= 2 && next.length - a.length <= 4, `${next.length - a.length} joined`);
  for (const x of next) {
    assert.ok(x.bot && !x.pid.startsWith('p'), 'never mistaken for a real player id');
    assert.match(x.nick, /^[A-Z][a-z]+ [A-Z][a-z]+ \d{2}$/);
    assert.ok(x.g >= 1 && x.g <= 9 && ['🦊', '🐼', '🐯'].includes(x.av));
  }
  assert.ok(next.some(x => x.wk === Board.weekId(d(2026, 11, 5))) && next.some(x => !x.wk), 'some played this week, some drifted away');
});

test('a real player always leads, and the crowd only joins views that have a real player', () => {
  const crowd = crowdOf(Board, TODAY);
  let withCrowd = 0;
  for (const v of views()) {
    const o = opts(Object.assign({ week: WEEK, today: TODAY }, v)), real = Board.rows(family, o), all = Board.rows(family, o, crowd);
    const label = JSON.stringify(v);
    if (!real.length) { assert.equal(all.length, 0, `no crowd without a real player: ${label}`); continue; }
    assert.ok(!all[0].bot, `a real player leads ${label}`);
    const best = real[0].value;
    for (const r of all) if (r.bot) assert.ok(r.value < best, `${r.nick} ${r.value} stays below ${best} in ${label}`);
    if (all.length > real.length) withCrowd++;
  }
  assert.ok(withCrowd > 20, `the crowd shows up in ${withCrowd} views`);
});

test('most of the crowd sits below every real player; weekly views only show this week\'s', () => {
  const crowd = crowdOf(Board, TODAY);
  const all = Board.rows(family, opts({ week: WEEK, today: TODAY }), crowd), bots = all.filter(r => r.bot);
  const lowest = Math.min(...all.filter(r => !r.bot).map(r => r.value));
  assert.ok(bots.length >= 20, `${bots.length} in the crowd`);
  assert.ok(bots.filter(r => r.value < lowest).length / bots.length >= 0.7, 'mostly below the lowest real player');
  assert.ok(bots.some(r => r.value >= lowest), 'but a few are worth overtaking');
  const week = Board.rows(family, opts({ week: WEEK, today: TODAY, period: 'week' }), crowd).filter(r => r.bot);
  assert.ok(week.length > 0 && week.every(r => r.wk === WEEK));
  assert.ok(week.length < bots.length, 'players who drifted away are only on the all-time board');
});
