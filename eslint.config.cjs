const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const playwright = require('eslint-plugin-playwright');
const prettier = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-undef': 'off', // TS handles this
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  prettier,
  {
    // Playwright linting for tests
    files: ['tests/**/*.{ts,js}', 'src/**/*.{spec,test}.ts'],
    ...playwright.configs['flat/recommended'],
  },
  {
    ignores: [
      'node_modules',
      'dist',
      'tests-output',
      'tests-report',
      'playwright-report',
      'test-results',
    ]
  }
];
