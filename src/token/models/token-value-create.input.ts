import { Field, InputType } from '@nestjs/graphql'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

import { ValidateAsLang } from '~/helpers/validators'

@InputType()
export class TokenValueCreate {
  @ApiProperty()
  @Field()
  @ValidateAsLang()
  lang!: string

  /**
   * @todo Max length?
   */
  @ApiProperty()
  @Field()
  @IsNotEmpty({ message: '$property → Should not be empty' })
  @IsString({ message: '$property → Must be a string' })
  value!: string
}
