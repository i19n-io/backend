import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { TransformToStringList } from '~/helpers/transformers'
import { ValidateAsLang } from '~/helpers/validators'

export class TokenValueListQuery {
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
