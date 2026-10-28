import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

// Family sync keeps the copy with more progress; a later save with less progress never wins
const { PMLM_MERGE: M } = load(['merge.js'], {}, ['PMLM_MERGE']);
const kid = (answered, rounds, updatedAt, extra = {}) => Object.assign({ id: 'p1', coins: 100, stats: { answered, rounds }, updatedAt, grades: {} }, extra);
const wish = (text, status = 'locked') => ({ at: 25, text, emoji: '🎈', status });

test('more progress wins, even when the other copy was saved later', () => {
  assert.equal(M.compare(kid(208, 20, 5), kid(150, 15, 9)), 1, 'the child\'s copy beats a stale copy saved later');
  assert.equal(M.compare(kid(150, 15, 9), kid(208, 20, 5)), -1);
  assert.equal(M.compare(kid(208, 20, 5), kid(208, 21, 1)), -1, 'the same answers: more rounds wins');
});

test('only a tie goes to the newer copy', () => {
  assert.equal(M.compare(kid(208, 20, 9), kid(208, 20, 5)), 1);
  assert.equal(M.compare(kid(208, 20, 5), kid(208, 20, 9)), -1);
  assert.equal(M.compare(kid(208, 20, 5), kid(208, 20, 5)), 0);
  assert.equal(M.compare(kid(0, 0, 0), { id: 'p1' }), 0, 'missing stats count as none');
});

test('a grown-up\'s newer edits in the losing copy are kept', () => {
  const child = kid(208, 20, 5, { grades: { 3: { wishes: [wish(''), wish('Bike', 'unlocked')] } }, grade: 3 });
  const parent = kid(150, 15, 9, { grades: { 3: { wishes: [wish('Ice cream'), wish('Bike', 'granted')] } }, board: 'name', grade: 4, streakWishes: [wish('Zoo')] });
  assert.equal(M.edits(child, parent), true);
  assert.equal(child.grades[3].wishes[0].text, 'Ice cream');
  assert.equal(child.grades[3].wishes[1].status, 'granted');
  assert.equal(child.board, 'name');
  assert.equal(child.grade, 4);
  assert.equal(child.streakWishes[0].text, 'Zoo');
  assert.equal(child.stats.answered, 208, 'progress is untouched');
  assert.equal(M.edits(child, parent), false, 'nothing more to carry');
});

test('older edits never replace newer ones, and coins are never merged', () => {
  const child = kid(208, 20, 9, { coins: 40, grades: { 3: { wishes: [wish('Lego')] } } });
  const old = kid(150, 15, 5, { coins: 500, grades: { 3: { wishes: [wish('Old idea')] } }, board: 'hidden' });
  M.edits(child, old);
  assert.equal(child.grades[3].wishes[0].text, 'Lego');
  assert.equal(child.board, undefined);
  assert.equal(child.coins, 40, 'a purchase is never undone');
});
