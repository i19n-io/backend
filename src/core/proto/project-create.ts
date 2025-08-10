import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length } from 'class-validator'

import { PROJECT_NAME_MAX_LENGTH } from '~/core/proto/constants'
import { ApiPropertyLang, ApiPropertyUuid } from '~/core/proto/helpers'

export class ProjectCreate {
  /**
   * @see
   * - `PROJECT_NAME_MAX_LENGTH`
   */
  @ApiProperty({
    minLength: 1,
    maxLength: PROJECT_NAME_MAX_LENGTH,
  })
  @IsString()
  @Length(1, PROJECT_NAME_MAX_LENGTH)
  readonly name!: string

  @ApiPropertyLang()
  readonly defaultLang!: string

  @ApiPropertyUuid()
  readonly authorId!: string
}
