import { Field, InputType } from '@nestjs/graphql'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator'

import { TOKEN_KEY_MAX_LENGTH } from '~/core/constants'
import { UuidScalar } from '~/core/graphql/scalars'

import { ValidateAsUuid } from '~/helpers/validators'

@InputType()
export class TokenKeyCreate {
  @Field(() => UuidScalar, { nullable: true })
  @IsOptional()
  @ValidateAsUuid()
  readonly parentId?: string

  /**
   * @see `TOKEN_KEY_MAX_LENGTH`
   */
  @Field()
  @MaxLength(TOKEN_KEY_MAX_LENGTH, {
    message: `$property → Must be shorter than or equal to ${TOKEN_KEY_MAX_LENGTH} characters`,
  })
  @IsNotEmpty({ message: '$property → Should not be empty' })
  @IsString({ message: '$property → Must be a string' })
  readonly key!: string

  /**
   * @todo Refactor position as enum
   */
  @Field()
  @IsEnum(['start', 'end', 'after'])
  readonly position!: 'start' | 'end' | 'after'

  @Field(() => UuidScalar, { nullable: true })
  @ValidateIf((o: TokenKeyCreate) => o.position === 'after')
  @ValidateAsUuid()
  readonly afterId!: string
}
