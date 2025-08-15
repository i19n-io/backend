import type { DynamicModule } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/node-postgres'

import { DatabaseService } from '~/core/database/database.service'
import * as schema from '~/core/database/schema'

import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  type ASYNC_OPTIONS_TYPE,
  type DatabaseModuleOptions,
  type OPTIONS_TYPE,
} from './database.definition'

export class DatabaseModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const { providers = [], exports = [], ...rest } = super.register(options)

    return {
      ...rest,
      providers: [
        ...providers,
        {
          provide: DatabaseService,
          useFactory: () => {
            const { connection, config } = options
            return drizzle({ connection, ...config })
          },
        },
      ],
      exports: [...exports, DatabaseService],
    }
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const {
      providers = [],
      exports = [],
      ...rest
    } = super.registerAsync(options)

    return {
      ...rest,
      providers: [
        ...providers,
        {
          provide: DatabaseService,
          inject: [MODULE_OPTIONS_TOKEN],
          useFactory: (moduleOptions: DatabaseModuleOptions) => {
            const { connection, config } = moduleOptions
            return drizzle({ connection, ...config })
          },
        },
      ],
      exports: [...exports, DatabaseService],
    }
  }
}

export const databaseModule = DatabaseModule.registerAsync({
  isGlobal: true,
  inject: [ConfigService],
  useFactory(configService: ConfigService) {
    return {
      config: {
        schema,
        casing: 'snake_case',

        // Use only in development
        // logger: true,
      },
      connection: configService.get('db'),
    }
  },
})
