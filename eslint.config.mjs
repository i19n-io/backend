// @ts-check
import { includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import consistentDefaultExportName from 'eslint-plugin-consistent-default-export-name'
import { importX } from 'eslint-plugin-import-x'
import pluginJest from 'eslint-plugin-jest'
import nodeImport from 'eslint-plugin-node-import'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'

const isProduction = process.env.NODE_ENV === 'production'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default tseslint.config(
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  {
    ignores: ['eslint.config.mjs'],
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
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*-spec.ts', '**/*.spec.ts'],
    ...pluginJest.configs['flat/recommended'],
    ...pluginJest.configs['flat/style'],
    rules: {
      ...pluginJest.configs['flat/recommended'].rules,
      ...pluginJest.configs['flat/style'].rules,

      // https://typescript-eslint.io/rules/unbound-method
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error',

      'jest/valid-title': ['error', { ignoreTypeOfDescribeName: true }],
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
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '~/**',
              group: 'internal',
              position: 'before',
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
      '@typescript-eslint/no-unused-vars': isProduction ? 'error' : 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],

      'no-console': isProduction ? 'error' : 'warn',
      'no-debugger': isProduction ? 'error' : 'warn',
      'prefer-destructuring': ['error', { object: true }],
      'quotes': ['warn', 'single', { avoidEscape: true }],

      // https://github.com/sindresorhus/eslint-plugin-unicorn#rules
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
