/**
 * See validation and default values in `src/core/config.module.ts`
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production'

      HTTP_PORT: string // numeric

      DB_HOST?: string
      DB_PORT?: string // numeric
      DB_NAME: string
      DB_USER: string
      DB_PASS: string
    }
  }
}

export {}
