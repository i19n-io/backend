import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, IsUUID } from 'class-validator'

import { ApiPropertyUuid } from '~/core/proto/helpers'

export class TokenKeyListQuery {
  @ApiPropertyUuid()
  readonly project!: string

  @ApiPropertyOptional({
    description:
      'Filter by parent. UUID for a specific parent, `null` (or empty) ' +
      'to return only top-level keys. Omit to return every key in the project.',
    format: 'uuid',
    example: 'null',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'null' || value === ''
      ? // eslint-disable-next-line unicorn/no-null -- service signature distinguishes null (top-level) from undefined (no filter)
        null
      : (value as unknown),
  )
  @IsUUID(4, { message: '$property → Must be a UUID or "null"' })
  readonly parent?: string | null
}
