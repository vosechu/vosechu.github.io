import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sparklinePath } from '../src/sparkline.js';

test('empty series yields an empty path', () => {
  assert.equal(sparklinePath([], 100, 20, 1000), '');
});
test('a flat series draws a flat line within the box', () => {
  const d = sparklinePath([50, 50, 50], 100, 20, 1000);
  assert.match(d, /^M /);                 // starts with a moveto
  assert.ok(!/-\d/.test(d));              // no negative coordinates: stays in the box
});
test('values at or above the ceiling clip to the top of the box (y = 0)', () => {
  const d = sparklinePath([2000], 100, 20, 1000);   // 2000 > ceiling 1000
  assert.match(d, /(^| )\S+,0(\s|$)/);     // a point clamped to y = 0 (the ceiling)
});
