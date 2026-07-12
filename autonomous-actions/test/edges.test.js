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

import { edgeEndpoints } from '../src/edges.js';

test('edgeEndpoints leaves the source right-center and lands on the target left-center', () => {
  const from = { left: 0, top: 0, width: 100, height: 40 };   // right-center = (100, 20)
  const to = { left: 300, top: 100, width: 80, height: 60 };  // left-center  = (300, 130)
  assert.deepEqual(edgeEndpoints(from, to), { x1: 100, y1: 20, x2: 300, y2: 130 });
});

test('edgeEndpoints handles a target above the source (upward fan-out)', () => {
  const from = { left: 0, top: 200, width: 100, height: 40 };  // right-center = (100, 220)
  const to = { left: 300, top: 0, width: 80, height: 40 };     // left-center  = (300, 20)
  assert.deepEqual(edgeEndpoints(from, to), { x1: 100, y1: 220, x2: 300, y2: 20 });
});
