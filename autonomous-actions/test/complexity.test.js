import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Linter } from 'eslint';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(HERE, '..', 'src');
const BASELINE_FILE = join(HERE, 'complexity-baseline.json');

// Reuse ESLint's own cyclomatic-complexity metric: with the threshold at 1 the
// rule reports EVERY function ("... has a complexity of N"), and we sum the N's.
// No new dependency -- eslint is already here for linting.
const linter = new Linter();
const PROBE = {
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: { complexity: ['warn', 1] },
};

function aggregateComplexity() {
  let total = 0;
  for (const file of readdirSync(SRC_DIR).filter((n) => n.endsWith('.js'))) {
    const code = readFileSync(join(SRC_DIR, file), 'utf8');
    for (const msg of linter.verify(code, PROBE)) {
      const match = /complexity of (\d+)/.exec(msg.message);
      if (match) total += Number(match[1]);
    }
  }
  return total;
}

test('aggregate src/ complexity stays at or below the committed baseline', () => {
  // AI-DEV: Aggregate complexity ratchet. Sums EVERY function's cyclomatic
  // complexity across src/, not per-function counts. If this fails because the
  // total ROSE, cut complexity, or raise complexity-baseline.json on purpose in the
  // SAME commit (that bump is a visible, reviewed diff). If it FELL, lower the
  // baseline to lock the win in. Never weaken, skip, or delete this test to pass it.
  const total = aggregateComplexity();
  const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8')).total;
  assert.ok(
    total <= baseline,
    `aggregate src/ complexity is ${total}, baseline is ${baseline}. Cut it, or raise the baseline on purpose.`,
  );
});
