import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTS, actMeta } from '../src/scenarios.js';
import { STRINGS } from '../src/strings.js';

test('there are eight acts', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  assert.equal(ACTS.length, 8);
});

test('every act carries a title, caption, and player instruction', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  for (let i = 0; i < ACTS.length; i++) {
    const m = actMeta(i);
    assert.ok(m.title && m.title.length > 0);
    assert.ok(m.caption && m.caption.length > 0);
    assert.ok(m.instruction && m.instruction.length > 0);
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
  // actMeta pulls player-facing copy from STRINGS by index and folds in the
  // structural readoutVisible from ACTS.
  const m = actMeta(3);
  assert.equal(m.title, STRINGS.acts[3].title);
  assert.equal(m.instruction, STRINGS.acts[3].instruction);
  assert.equal(m.readoutVisible, ACTS[3].readoutVisible);
});
