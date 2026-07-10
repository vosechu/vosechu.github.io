import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTS, actMeta } from '../src/scenarios.js';

test('there are eight acts', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  assert.equal(ACTS.length, 8);
});

test('every act carries a title, caption, and player instruction', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  for (const act of ACTS) {
    assert.ok(act.title && act.title.length > 0);
    assert.ok(act.caption && act.caption.length > 0);
    assert.ok(act.instruction && act.instruction.length > 0);
  }
});

test('acts are guide-only: they carry no state patch', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  // The sim stays however the player left it, so no act may mutate config.
  for (const act of ACTS) assert.equal(typeof act.patch, 'undefined');
});

test('the tour readout is reserved for the adaptive act and free play', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  // Little's Law moved to its own diagram panel; the tour readout now carries only
  // the adaptive-sizing line, so it shows on the adaptive act (index 6) and after.
  assert.deepEqual(ACTS.map((a) => a.readoutVisible), [false, false, false, false, false, false, true, true]);
});

test('actMeta returns the fields the tour renders for an act', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  // Act 4 (index 3) is the Analytics-timeout act; Reports slows at index 4.
  const meta = actMeta(3);
  assert.equal(meta.title, 'Incident: Analytics hangs');
  assert.equal(meta.readoutVisible, false);
  assert.ok(meta.instruction.includes('timeout'));
  assert.equal(actMeta(4).title, 'Incident: Reports slows down');
});
