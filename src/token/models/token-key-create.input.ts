import { Field, InputType } from '@nestjs/graphql'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator'
import { UUIDResolver } from 'graphql-scalars'

import { TOKEN_KEY_MAX_LENGTH } from '~/core/constants'
import { ApiPropertyUuidOptional } from '~/core/proto/helpers'

import { ValidateAsUuid } from '~/helpers/validators'

const POSITIONS = ['start', 'end', 'after'] as const
export type TokenKeyPosition = (typeof POSITIONS)[number]

@InputType()
export class TokenKeyCreate {
  @ApiPropertyUuidOptional()
  @Field(() => UUIDResolver, { nullable: true })
  @IsOptional()
  @ValidateAsUuid()
  readonly parentId?: string

  /**
   * @see `TOKEN_KEY_MAX_LENGTH`
   */
  @ApiProperty({ maxLength: TOKEN_KEY_MAX_LENGTH })
  @Field()
  @MaxLength(TOKEN_KEY_MAX_LENGTH, {
    message: `$property → Must be shorter than or equal to ${TOKEN_KEY_MAX_LENGTH} characters`,
  })
  @IsNotEmpty({ message: '$property → Should not be empty' })
  @IsString({ message: '$property → Must be a string' })
  readonly key!: string

  @ApiProperty({ enum: POSITIONS })
  @Field()
  @IsEnum(POSITIONS)
  readonly position!: TokenKeyPosition

  @ApiPropertyUuidOptional({
    description: 'Required when `position` is "after"',
  })
  @Field(() => UUIDResolver, { nullable: true })
  @ValidateIf((o: TokenKeyCreate) => o.position === 'after')
  @ValidateAsUuid()
  readonly afterId?: string
}
