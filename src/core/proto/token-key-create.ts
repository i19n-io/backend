import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator'

import { TOKEN_KEY_MAX_LENGTH } from '~/core/proto/constants'
import { ApiPropertyUuid } from '~/core/proto/helpers'

export class TokenKeyCreate {
  @ApiPropertyUuid({ required: false })
  @IsOptional() // FIXME: check for empty string!
  readonly parentId?: string

  /**
   * @see `TOKEN_KEY_MAX_LENGTH`
   */
  @ApiProperty({
    minLength: 1,
    maxLength: TOKEN_KEY_MAX_LENGTH,
    examples: ['login', 'buttonLabel', 'PageDocuments', 'title', 'common'],
  })
  @IsString()
  @IsNotEmpty() // FIXME: length validation
  readonly key!: string

  // ===============================================

  @ApiProperty({ enum: ['start', 'end', 'after'] })
  @IsEnum(['start', 'end', 'after'])
  readonly position!: 'start' | 'end' | 'after'

  @ApiPropertyUuid({
    required: false,
    description:
      'ID of the item to insert after. Required when `position: after`',
  })
  @ValidateIf((o: TokenKeyCreate) => o.position === 'after')
  @IsUUID(4)
  @IsNotEmpty()
  readonly afterId!: string
}
