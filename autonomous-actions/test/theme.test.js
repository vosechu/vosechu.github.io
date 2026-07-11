import { test } from 'node:test';
import assert from 'node:assert/strict';
import { labelOf, shortOf, hoverOf, colorOf, act } from '../src/theme.js';
import { STRINGS } from '../src/strings.js';

test('theme lookups read station copy from STRINGS by id', () => {
  for (const id of ['Database A', 'Service B', 'Service C', 'External']) {
    assert.equal(labelOf(id), STRINGS.stations[id].label);
    assert.equal(shortOf(id), STRINGS.stations[id].short);
    assert.equal(hoverOf(id), STRINGS.stations[id].hover);
  }
});

test('every station id maps to a color variable', () => {
  for (const id of ['Database A', 'Service B', 'Service C', 'External']) {
    assert.match(colorOf(id), /^var\(--/);
  }
});

test('act() returns the STRINGS act entry by index', () => {
  assert.equal(act(3).title, STRINGS.acts[3].title);
  assert.equal(act(3).instruction, STRINGS.acts[3].instruction);
  assert.equal(act(3).caption, STRINGS.acts[3].caption);
});

test('unknown id falls back to the id itself, not a crash', () => {
  assert.equal(labelOf('Nope'), 'Nope');
});
