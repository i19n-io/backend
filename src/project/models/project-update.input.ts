import { Field, InputType } from '@nestjs/graphql'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { UUIDResolver } from 'graphql-scalars'

import { PROJECT_NAME_MAX_LENGTH } from '~/core/constants'
import { ApiPropertyUuidOptional } from '~/core/proto/helpers'

import { ValidateAsLang, ValidateAsUuid } from '~/helpers/validators'

@InputType()
export class ProjectUpdate {
  /**
   * @see `PROJECT_NAME_MAX_LENGTH`
   */
  @ApiPropertyOptional({ maxLength: PROJECT_NAME_MAX_LENGTH })
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(PROJECT_NAME_MAX_LENGTH, {
    message: `$property → Must be shorter than or equal to ${PROJECT_NAME_MAX_LENGTH} characters`,
  })
  @IsNotEmpty({ message: '$property → Should not be empty' })
  @IsString({ message: '$property → Must be a string' })
  readonly name?: string

  @ApiPropertyOptional({ example: 'en' })
  @Field({ nullable: true })
  @IsOptional()
  @ValidateAsLang()
  readonly defaultLang?: string

  @ApiPropertyUuidOptional()
  @Field(() => UUIDResolver, { nullable: true })
  @IsOptional()
  @ValidateAsUuid()
  readonly authorId?: string
}
