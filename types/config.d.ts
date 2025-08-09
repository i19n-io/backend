import type { Path, PathValue } from '@nestjs/config'

import type { config } from '~/core/config.module'

type Config = ReturnType<typeof config>

declare module '@nestjs/config' {
  export class ConfigService {
    get<T = Config, P extends Path<T> = any>(propertyPath: P): PathValue<T, P>
  }
}
