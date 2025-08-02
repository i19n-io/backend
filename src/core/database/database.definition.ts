import { ConfigurableModuleBuilder } from '@nestjs/common'
import type { DrizzleConfig } from 'drizzle-orm'
import type { PoolConfig } from 'pg'

export interface DatabaseModuleOptions {
  connection: PoolConfig
  config?: DrizzleConfig<Record<string, unknown>>
}

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<DatabaseModuleOptions>()
  .setExtras(
    {
      isGlobal: false,
    },
    (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }),
  )
  .build()
