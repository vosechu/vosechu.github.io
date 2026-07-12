import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breakerLabel, serviceSub, capacityReadout } from '../src/telemetry.js';
import { STRINGS } from '../src/strings.js';

test('breakerLabel maps each engine breaker state to its plain-language copy', () => {
  assert.equal(breakerLabel('closed'), STRINGS.telemetry.breaker.closed);
  assert.equal(breakerLabel('open'), STRINGS.telemetry.breaker.open);
  assert.equal(breakerLabel('half_open'), STRINGS.telemetry.breaker.half_open);
});

test('breakerLabel falls back to the raw state rather than crashing on an unknown one', () => {
  assert.equal(breakerLabel('mystery'), 'mystery');
});

test('serviceSub injects the worker and connection counts and leaves no unfilled tokens', () => {
  const s = serviceSub(30, 12);
  assert.match(s, /\b30\b/);
  assert.match(s, /\b12\b/);
  assert.doesNotMatch(s, /\{|\}/);
});

test('capacityReadout with no queue reports only what is in service', () => {
  const s = capacityReadout(8, 12, 0);
  assert.match(s, /\b8\b/);
  assert.match(s, /\b12\b/);
  assert.doesNotMatch(s, /\{|\}/);
});

test('capacityReadout with a queue reports the held total, in service, and queued', () => {
  const s = capacityReadout(8, 12, 3);
  assert.match(s, /\b11\b/);                       // held = inService + queued
  assert.match(s, /\b3\b/);                        // queued
  assert.doesNotMatch(s, /\{|\}/);
  assert.notEqual(s, capacityReadout(8, 12, 0));   // the queued branch differs from the idle one
});
