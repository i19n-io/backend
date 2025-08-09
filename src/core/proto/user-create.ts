import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Matches } from 'class-validator'

import { USER_NAME_MAX_LENGTH, USER_NAME_PATTERN } from '~/core/proto/constants'

export class UserCreate {
  /**
   * @see
   * - `USER_NAME_MAX_LENGTH`
   * - `USER_NAME_PATTERN`
   */
  @ApiProperty({
    minLength: 1,
    maxLength: USER_NAME_MAX_LENGTH,
    pattern: USER_NAME_PATTERN,
    examples: ['John Doe', 'Jane Smith'],
  })
  @Matches(USER_NAME_PATTERN)
  @IsString()
  @IsNotEmpty()
  readonly name!: string
}
