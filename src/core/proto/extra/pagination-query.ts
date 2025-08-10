import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { LIMIT_DEFAULT, LIMIT_MAX } from '~/core/proto/constants'
import { IsIntBetween, TransformToInt } from '~/core/proto/helpers'

export class PaginationQuery {
  @ApiProperty({
    type: 'integer',
    required: false,
    minimum: 1,
    maximum: LIMIT_MAX,
    default: LIMIT_DEFAULT,
  })
  @TransformToInt()
  @IsOptional()
  @IsIntBetween(1, LIMIT_MAX)
  readonly limit = LIMIT_DEFAULT

  @ApiProperty({
    type: 'integer',
    required: false,
    minimum: 0,
    default: 0,
  })
  @TransformToInt()
  @IsOptional()
  @IsIntBetween(0, Number.MAX_SAFE_INTEGER)
  readonly offset = 0
}
