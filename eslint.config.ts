import { includeIgnoreFile } from '@eslint/compat'
import * as eslint from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import * as vitest from '@vitest/eslint-plugin'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import consistentDefaultExportName from 'eslint-plugin-consistent-default-export-name'
import { importX } from 'eslint-plugin-import-x'
import nodeImport from 'eslint-plugin-node-import'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginUnicorn from 'eslint-plugin-unicorn'
import * as globals from 'globals'
import { join } from 'node:path'
import tseslint from 'typescript-eslint'

const isProduction = process.env.NODE_ENV === 'production'

export default tseslint.config(
  includeIgnoreFile(
    join(__dirname, '.gitignore'),
    'Imported .gitignore patterns',
  ),
  {
    ignores: ['eslint.config.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  pluginPrettierRecommended,
  pluginUnicorn.configs.all,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ['**/*.{mjs,ts}'],
    plugins: {
      'node-import': nodeImport,
      'consistent-default-export-name': consistentDefaultExportName,
    },
    rules: {
      'node-import/prefer-node-protocol': 'error',
      'consistent-default-export-name/default-export-match-filename': [
        'error',
        'kebab',
      ],
      'consistent-default-export-name/default-import-match-filename': 'error',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*.test.ts'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'unicorn/no-null': 'off',
      'vitest/valid-title': ['error', { ignoreTypeOfDescribeName: true }],
    },
  },
  {
    files: ['**/*.{mjs,ts}'],
    languageOptions: { parser: tsParser },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({ project: '<root>/tsconfig.json' }),
      ],
    },
    rules: {
      'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          'pathGroups': [
            {
              pattern: '~/core/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '~/e2e/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/**',
              group: 'external',
              position: 'after',
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        { allowWithDecorator: true },
      ],
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        isProduction ? 'error' : 'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],

      'no-console': isProduction ? 'error' : 'warn',
      'no-debugger': isProduction ? 'error' : 'warn',
      'no-useless-return': 'error',
      'prefer-destructuring': ['error', { object: true }],
      'quotes': ['warn', 'single', { avoidEscape: true }],

      // https://github.com/sindresorhus/eslint-plugin-unicorn#rules
      'unicorn/import-style': [
        'error',
        {
          styles: {
            'node:path': {
              default: false,
              named: true,
            },
            'path': {
              default: false,
              named: true,
            },
          },
        },
      ],
      'unicorn/no-nested-ternary': 'off',
      'unicorn/prefer-at': ['error', { checkAllIndexAccess: true }],
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: { db: true },
          ignore: ['e2e'],
        },
      ],
      'unicorn/switch-case-braces': 'off',
    },
  },
)
