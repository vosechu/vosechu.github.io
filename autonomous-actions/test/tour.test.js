import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_STEPS, TOUR_STEP_DEFS, shouldAutoOpen, NEW_CONTROLS_BY_ACT } from '../src/tour.js';
import { STRINGS } from '../src/strings.js';

// Step navigation and popover positioning now live in Driver.js; these tests
// cover only the pure, DOM-free logic tour.js still owns.

test('the tour has five steps', () => {
  assert.equal(TOUR_STEPS, 5);
  assert.equal(TOUR_STEP_DEFS.length, 5);
});

test('every tour step names copy that exists in STRINGS.tour', () => {
  for (const def of TOUR_STEP_DEFS) {
    assert.ok(typeof def.copyKey === 'string' && def.copyKey.length > 0);
    assert.ok(Object.hasOwn(STRINGS.tour, def.copyKey), `STRINGS.tour missing "${def.copyKey}"`);
  }
});

test('only the first step is a centered popover; the rest spotlight an element', () => {
  assert.equal(TOUR_STEP_DEFS[0].element, null);
  for (const def of TOUR_STEP_DEFS.slice(1)) {
    assert.ok(typeof def.element === 'string' && def.element.length > 0, `step "${def.copyKey}" needs a selector`);
  }
});

test('the tour auto-opens only for a visitor who has not seen it', () => {
  assert.equal(shouldAutoOpen(false), true);
  assert.equal(shouldAutoOpen(true), false);
});

test('NEW_CONTROLS_BY_ACT covers exactly the acts that unlock or reveal controls', () => {
  assert.deepEqual(Object.keys(NEW_CONTROLS_BY_ACT).map(Number).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
  for (const list of Object.values(NEW_CONTROLS_BY_ACT)) assert.ok(Array.isArray(list) && list.length > 0);
});
