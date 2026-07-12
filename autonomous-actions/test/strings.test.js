import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../src/strings.js';

// Walk every string value in STRINGS (any nesting).
function collectStrings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (node && typeof node === 'object') for (const v of Object.values(node)) collectStrings(v, out);
  return out;
}
const all = collectStrings(STRINGS);
const chipTokens = all.flatMap((s) => [...s.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]));
const termTokens = all.flatMap((s) => [...s.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]));

test('STRINGS.controls exists and every label is a nonempty string', () => {
  const labels = Object.values(STRINGS.controls);
  assert.ok(labels.length >= 14);
  for (const l of labels) assert.ok(typeof l === 'string' && l.length > 0);
});

test('STRINGS.glossary exists with lowercase keys and nonempty definitions', () => {
  const entries = Object.entries(STRINGS.glossary);
  assert.ok(entries.length >= 12);
  for (const [k, v] of entries) {
    assert.equal(k, k.toLowerCase(), `glossary key "${k}" must be lowercase`);
    assert.ok(typeof v === 'string' && v.length > 0);
  }
});

test('every {{chip}} in STRINGS names a real control label, exactly', () => {
  const labels = new Set(Object.values(STRINGS.controls));
  for (const chip of chipTokens) assert.ok(labels.has(chip), `chip {{${chip}}} has no matching control label`);
});

test('every [[term]] in STRINGS resolves to a glossary entry (case-insensitive)', () => {
  for (const term of termTokens) {
    assert.ok(Object.hasOwn(STRINGS.glossary, term.toLowerCase()), `term [[${term}]] missing from glossary`);
  }
});

test('the act copy references control chips (instructions stay actionable)', () => {
  const actStrings = collectStrings(STRINGS.acts);
  const chips = actStrings.flatMap((s) => [...s.matchAll(/\{\{([^}]+)\}\}/g)]);
  assert.ok(chips.length >= 6, 'expected the audited act copy to name controls as {{chips}}');
});
