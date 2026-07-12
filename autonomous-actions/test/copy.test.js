import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCopy, glossaryDef } from '../src/copy.js';

test('plain text passes through as one text segment', () => {
  assert.deepEqual(parseCopy('No tokens here.'), [{ type: 'text', value: 'No tokens here.' }]);
});

test('a {{chip}} splits into text, ctl, text', () => {
  assert.deepEqual(parseCopy('Turn on {{Breakers}} now'), [
    { type: 'text', value: 'Turn on ' },
    { type: 'ctl', value: 'Breakers' },
    { type: 'text', value: ' now' },
  ]);
});

test('a [[term]] becomes a term segment keeping its casing', () => {
  assert.deepEqual(parseCopy('within the [[SLO]].'), [
    { type: 'text', value: 'within the ' },
    { type: 'term', value: 'SLO' },
    { type: 'text', value: '.' },
  ]);
});

test('adjacent tokens produce no empty text segments', () => {
  assert.deepEqual(parseCopy('{{Breakers}}[[breaker]]'), [
    { type: 'ctl', value: 'Breakers' },
    { type: 'term', value: 'breaker' },
  ]);
});

test('malformed tokens render as plain text, never throw', () => {
  assert.deepEqual(parseCopy('a {{b [[c'), [{ type: 'text', value: 'a {{b [[c' }]);
});

test('glossaryDef is case-insensitive and null for unknown terms', () => {
  assert.equal(typeof glossaryDef('SLO'), 'string');
  assert.equal(glossaryDef('slo'), glossaryDef('SLO'));
  assert.equal(glossaryDef('flux capacitor'), null);
});
