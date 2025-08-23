import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

import { ValidateAsLang } from '~/helpers/validators'

@InputType()
export class TokenValueCreate {
  @Field()
  @ValidateAsLang()
  lang!: string

  /**
   * @todo Max length?
   */
  @Field()
  @IsNotEmpty({ message: '$property → Should not be empty' })
  @IsString({ message: '$property → Must be a string' })
  value!: string
}
