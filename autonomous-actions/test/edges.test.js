import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toLocalRect } from '../src/edges.js';

test('toLocalRect subtracts the container origin and keeps size', () => {
  const rect = { left: 130, top: 96, width: 90, height: 60 };
  const container = { left: 30, top: 16, width: 1000, height: 500 };
  assert.deepEqual(toLocalRect(rect, container), { left: 100, top: 80, width: 90, height: 60 });
});

test('toLocalRect of the container itself sits at the origin', () => {
  const container = { left: 30, top: 16, width: 1000, height: 500 };
  assert.deepEqual(toLocalRect(container, container), { left: 0, top: 0, width: 1000, height: 500 });
});
