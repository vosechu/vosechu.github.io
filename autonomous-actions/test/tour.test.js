import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_STEPS, initialTourState, tourReducer } from '../src/tour.js';

test('first visit auto-opens at step 0', () => {
  assert.deepEqual(initialTourState(false), { open: true, step: 0, seen: false });
});
test('a seen tour does not auto-open', () => {
  assert.equal(initialTourState(true).open, false);
});
test('next advances until the last step', () => {
  let s = initialTourState(false);
  for (let i = 1; i < TOUR_STEPS; i++) s = tourReducer(s, { type: 'next' });
  assert.equal(s.step, TOUR_STEPS - 1);
  assert.equal(s.open, true);
});
test('next on the last step closes and marks seen', () => {
  let s = { open: true, step: TOUR_STEPS - 1, seen: false };
  s = tourReducer(s, { type: 'next' });
  assert.equal(s.open, false);
  assert.equal(s.seen, true);
});
test('skip from any step closes and marks seen', () => {
  const s = tourReducer({ open: true, step: 1, seen: false }, { type: 'skip' });
  assert.equal(s.open, false);
  assert.equal(s.seen, true);
});
test('re-run opens at step 0 and does not clear seen', () => {
  const s = tourReducer({ open: false, step: 2, seen: true }, { type: 'open' });
  assert.deepEqual(s, { open: true, step: 0, seen: true });
});
test('step never leaves [0, TOUR_STEPS-1]', () => {
  let s = { open: true, step: TOUR_STEPS - 1, seen: false };
  s = tourReducer(s, { type: 'next' });   // closes; step must not exceed bound
  assert.ok(s.step <= TOUR_STEPS - 1 && s.step >= 0);
});
