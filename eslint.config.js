import js from '@eslint/js';

export default [
  {
    files: ['backend/src/main/resources/static/js/**/*.js', 'tests/unit/frontend/**/*.js', 'eslint.config.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        fetch: 'readonly', URL: 'readonly', Headers: 'readonly', URLSearchParams: 'readonly',
        HTMLButtonElement: 'readonly', HTMLInputElement: 'readonly', Response: 'readonly',
        document: 'readonly', window: 'readonly', FormData: 'readonly',
        HTMLFormElement: 'readonly', HTMLFieldSetElement: 'readonly',
      },
    },
  },
  {
    files: ['tests/browser/**/*.js', 'tests/browser/**/*.mjs', 'playwright.config.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest', sourceType: 'module',
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly', URLSearchParams: 'readonly', document: 'readonly', window: 'readonly', localStorage: 'readonly', sessionStorage: 'readonly' },
    },
  },
];
