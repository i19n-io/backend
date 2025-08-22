import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
    },
    projects: [
      {
        extends: true,
        test: {
          name: { label: 'unit', color: 'blue' },
          dir: './src',
        },
      },
      {
        extends: true,
        test: {
          name: { label: 'e2e', color: 'magenta' },
          dir: './e2e',
          globalSetup: './e2e/global-setup.ts',
        },
      },
    ],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '~/e2e': '/e2e',
      '~': '/src',
    },
  },
})
