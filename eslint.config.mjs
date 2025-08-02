// @ts-check
import { includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import consistentDefaultExportName from 'eslint-plugin-consistent-default-export-name'
import { importX } from 'eslint-plugin-import-x'
import nodeImport from 'eslint-plugin-node-import'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
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
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
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
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': isProduction ? 'error' : 'warn',
      'no-console': isProduction ? 'error' : 'warn',
      'no-debugger': isProduction ? 'error' : 'warn',
      'prefer-destructuring': ['error', { object: true }],
    },
  },
)
