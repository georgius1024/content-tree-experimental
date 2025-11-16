import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vuePlugin from 'eslint-plugin-vue';
import eslintPluginImport from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/*.cjs',
      '**/*.mjs',
      '**/tailwind.config.*',
      '**/postcss.config.*',
      '**/vite.config.*',
      '**/tsconfig*.json',
      '**/package*.json',
      '**/dist/**',
      '**/node_modules/**',
      '**/scripts/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Vue recommended flat config
  vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    plugins: {
      import: eslintPluginImport
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      // Import order (generic, adapted from a-fill)
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type'
          ],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'after' }],
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],

      // Custom restrictions (from a-fill)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.type=\"ArrowFunctionExpression\"]',
          message:
            'IIFE (Immediately Invoked Function Expression) is not allowed. Use a named function instead.'
        },
        {
          selector: 'CallExpression[callee.type=\"FunctionExpression\"]',
          message:
            'IIFE (Immediately Invoked Function Expression) is not allowed. Use a named function instead.'
        },
        {
          selector: 'ImportExpression',
          message: 'Dynamic imports are not allowed. Use static imports instead.'
        }
      ],

      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'prefer-const': 'warn',
      'no-var': 'error'
    }
  },
  eslintConfigPrettier
);


