/**
 * See validation and default values in `src/core/config.module.ts`
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production'

      HTTP_PORT: string // numeric
    }
  }
}

export {}
