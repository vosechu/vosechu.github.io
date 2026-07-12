import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_STEPS, NEW_CONTROLS_BY_ACT, initialTourState, tourReducer } from '../src/tour.js';

test('the tour has five steps', () => {
  assert.equal(TOUR_STEPS, 5);
});
test('first visit auto-opens at step 0, not skipped', () => {
  assert.deepEqual(initialTourState(false, false), { open: true, step: 0, seen: false, skipped: false });
});
test('a seen tour does not auto-open and preserves a persisted skip', () => {
  const s = initialTourState(true, true);
  assert.equal(s.open, false);
  assert.equal(s.skipped, true);
});
test('next advances until the last step', () => {
  let s = initialTourState(false, false);
  for (let i = 1; i < TOUR_STEPS; i++) s = tourReducer(s, { type: 'next' });
  assert.equal(s.step, TOUR_STEPS - 1);
  assert.equal(s.open, true);
});
test('next on the last step closes, marks seen, and clears skipped', () => {
  let s = { open: true, step: TOUR_STEPS - 1, seen: false, skipped: true };
  s = tourReducer(s, { type: 'next' });
  assert.equal(s.open, false);
  assert.equal(s.seen, true);
  assert.equal(s.skipped, false);
});
test('skip from any step closes, marks seen, and sets skipped', () => {
  const s = tourReducer({ open: true, step: 1, seen: false, skipped: false }, { type: 'skip' });
  assert.equal(s.open, false);
  assert.equal(s.seen, true);
  assert.equal(s.skipped, true);
});
test('re-run opens at step 0, keeps seen, and clears skipped (the red dot)', () => {
  const s = tourReducer({ open: false, step: 2, seen: true, skipped: true }, { type: 'open' });
  assert.deepEqual(s, { open: true, step: 0, seen: true, skipped: false });
});
test('step never leaves [0, TOUR_STEPS-1]', () => {
  let s = { open: true, step: TOUR_STEPS - 1, seen: false, skipped: false };
  s = tourReducer(s, { type: 'next' });
  assert.ok(s.step <= TOUR_STEPS - 1 && s.step >= 0);
});
test('NEW_CONTROLS_BY_ACT covers exactly the acts that unlock or reveal controls', () => {
  assert.deepEqual(Object.keys(NEW_CONTROLS_BY_ACT).map(Number).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
  for (const list of Object.values(NEW_CONTROLS_BY_ACT)) assert.ok(Array.isArray(list) && list.length > 0);
});
