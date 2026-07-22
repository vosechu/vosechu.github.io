import js from '@eslint/js';
import globals from 'globals';
import seatbelt from 'eslint-seatbelt';

// eslint-seatbelt ratchets rule violations: existing ones are grandfathered in
// eslint.seatbelt.tsv, new ones fail the lint, and fixing one tightens the budget.
// It replaces the old hand-rolled acorn complexity gate. The `complexity` rule is
// the ratcheted metric; run `SEATBELT_INCREASE=complexity npx eslint .` to grandfather
// an existing offender on purpose, and `npm test` (or CI=1) fails on any new one.
export default [
  seatbelt.configs.enable,

  // Vendored third-party libraries are not ours to lint.
  { ignores: ['vendor/**'] },

  js.configs.recommended,

  {
    // Browser ES modules loaded directly by the page.
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      complexity: ['error', 10],
    },
  },

  {
    // Node context: the test suite and this config file.
    files: ['test/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
];
