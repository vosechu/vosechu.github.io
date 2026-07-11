import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availabilityPercent } from '../src/metrics.js';

test('all served requests succeed', () => {
  assert.equal(availabilityPercent({ successPerSec: 10, degradedPerSec: 0, clientErrorsPerSec: 0 }), 100);
});
test('degraded counts as available', () => {
  assert.equal(availabilityPercent({ successPerSec: 5, degradedPerSec: 5, clientErrorsPerSec: 0 }), 100);
});
test('all client errors is zero availability', () => {
  assert.equal(availabilityPercent({ successPerSec: 0, degradedPerSec: 0, clientErrorsPerSec: 10 }), 0);
});
test('nine of ten served is ninety percent', () => {
  assert.equal(availabilityPercent({ successPerSec: 9, degradedPerSec: 0, clientErrorsPerSec: 1 }), 90);
});
test('no traffic reads 100, never NaN', () => {
  assert.equal(availabilityPercent({ successPerSec: 0, degradedPerSec: 0, clientErrorsPerSec: 0 }), 100);
});
