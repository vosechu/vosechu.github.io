import js from '@eslint/js';
import globals from 'globals';

// ESLint handles linting (unused vars, undefined refs, etc.). Complexity is NOT
// gated here per-function; it is ratcheted in aggregate by test/complexity.test.js,
// which sums every function's complexity across src/ and fails if the total rises.
export default [
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
