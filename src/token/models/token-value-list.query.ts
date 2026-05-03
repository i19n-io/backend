import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { ApiPropertyUuid } from '~/core/proto/helpers'

import { TransformToStringList } from '~/helpers/transformers'
import { ValidateAsLang, ValidateAsUuid } from '~/helpers/validators'

export class TokenValueListQuery {
  @ApiPropertyUuid()
  @ValidateAsUuid()
  readonly projectId!: string

  @ApiPropertyOptional({
    type: String,
    description:
      'Comma-separated list of locales (e.g. `en,fr`). ' +
      'Repeated params (`?langs=en&langs=fr`) also work.',
    example: 'en,fr',
  })
  @IsOptional()
  @TransformToStringList()
  @ValidateAsLang({ each: true })
  readonly langs?: string[]
}
