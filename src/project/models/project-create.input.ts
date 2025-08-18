import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

import { PROJECT_NAME_MAX_LENGTH } from '~/core/constants'

import { ValidateAsLang, ValidateAsUuid } from '~/helpers/validators'

@InputType()
export class ProjectCreate {
  /**
   * @see `PROJECT_NAME_MAX_LENGTH`
   */
  @Field()
  @MaxLength(PROJECT_NAME_MAX_LENGTH, {
    message: `$property → Must be shorter than or equal to ${PROJECT_NAME_MAX_LENGTH} characters`,
  })
  @IsNotEmpty({ message: '$property → Should not be empty' })
  @IsString({ message: '$property → Must be a string' })
  readonly name!: string

  @Field()
  @ValidateAsLang()
  readonly defaultLang!: string

  @Field()
  @ValidateAsUuid()
  readonly authorId!: string
}
