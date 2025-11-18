// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vuePlugin from 'eslint-plugin-vue';
import eslintPluginImport from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import tailwindcss from 'eslint-plugin-tailwindcss';

export default tseslint.config({
  ignores: [
    '**/*.cjs',
    '**/*.mjs',
    '**/*.scss',
    '**/*.css',
    '**/tailwind.config.*',
    '**/postcss.config.*',
    '**/vite.config.*',
    '**/tsconfig*.json',
    '**/package*.json',
    '**/dist/**',
    '**/node_modules/**',
    '**/scripts/**'
  ]
}, js.configs.recommended, ...tseslint.configs.recommended, // Vue recommended flat config
vuePlugin.configs['flat/recommended'], {
  files: ['**/*.{ts,vue}'],
  plugins: {
    import: eslintPluginImport,
    tailwindcss: tailwindcss
  },
  languageOptions: {
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  rules: {
    // Tailwind CSS rules
    ...tailwindcss.configs.recommended.rules,
    
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
}, eslintConfigPrettier, storybook.configs["flat/recommended"]);


