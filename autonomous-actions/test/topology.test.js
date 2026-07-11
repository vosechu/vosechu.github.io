import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rosterForAct } from '../src/topology.js';

test('act 0 shows only the core datastore', () => {
  assert.deepEqual(rosterForAct(0), ['Database A']);
});
test('act 1 adds the third party', () => {
  const r = rosterForAct(1);
  assert.ok(r.includes('Database A') && r.includes('External'));
  assert.equal(r.length, 2);
});
test('act 3 adds the hanging service', () => {
  const r = rosterForAct(3);
  assert.ok(r.includes('Service C'));
  assert.equal(r.length, 3);
});
test('act 4 through 7 show all four', () => {
  for (const i of [4, 5, 6, 7]) assert.equal(rosterForAct(i).length, 4);
});
test('rosters are cumulative: each act is a superset of the previous', () => {
  for (let i = 1; i <= 7; i++) {
    const prev = new Set(rosterForAct(i - 1));
    for (const id of prev) assert.ok(rosterForAct(i).includes(id));
  }
});
