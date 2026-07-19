// copy.js
// Pure parser for the two copy tokens strings.js may embed:
//   [[term]]  - a glossary term; renders as a dotted-underline hover.
//   {{label}} - a control chip; must equal a right-panel control label
//               exactly (test/strings.test.js enforces this).
// parseCopy splits a string into segments; DOM glue (controls.js) turns
// segments into spans. Malformed tokens simply fail to match and pass
// through as plain text: this module never throws on copy.

import { STRINGS } from './strings.js';

const TOKEN = /\[\[([^\]]+)\]\]|\{\{([^}]+)\}\}/g;

export function parseCopy(str) {
  const out = [];
  let last = 0;
  for (const m of str.matchAll(TOKEN)) {
    if (m.index > last) out.push({ type: 'text', value: str.slice(last, m.index) });
    if (m[1] != null) out.push({ type: 'term', value: m[1] });
    else out.push({ type: 'ctl', value: m[2] });
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push({ type: 'text', value: str.slice(last) });
  return out;
}

// Definition for a [[term]], case-insensitive; null when the glossary has no
// entry (the strings test keeps that from shipping, this keeps it from throwing).
export function glossaryDef(term) {
  return STRINGS.glossary[term.toLowerCase()] ?? null;
}
