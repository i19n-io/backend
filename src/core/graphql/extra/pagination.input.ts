import { Field, InputType, Int } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'

import { LIMIT_DEFAULT, LIMIT_MAX } from '~/core/constants'

import { TransformToInt } from '~/helpers/transformers'
import { ValidateAsIntBetween } from '~/helpers/validators'

@InputType()
export class Pagination {
  @Field(() => Int, { defaultValue: LIMIT_DEFAULT })
  @TransformToInt()
  @IsOptional()
  @ValidateAsIntBetween(1, LIMIT_MAX)
  readonly limit: number = LIMIT_DEFAULT

  @Field(() => Int, { defaultValue: 0 })
  @TransformToInt()
  @IsOptional()
  @ValidateAsIntBetween(0, Number.MAX_SAFE_INTEGER)
  readonly offset: number = 0
}
