import { applyDecorators } from '@nestjs/common'
import {
  ApiProperty,
  ApiPropertyOptional,
  type ApiPropertyOptions,
} from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { ValidateAsUuid } from '~/helpers/validators'

export const ApiPropertyUuid = (options?: ApiPropertyOptions) =>
  applyDecorators(
    ApiProperty({
      format: 'uuid',
      minLength: 36,
      maxLength: 36,
      ...options,
    }),
    ValidateAsUuid(),
  )

export const ApiPropertyUuidOptional = (options?: ApiPropertyOptions) =>
  applyDecorators(
    ApiPropertyOptional({
      format: 'uuid',
      minLength: 36,
      maxLength: 36,
      ...options,
    }),
    IsOptional(),
    ValidateAsUuid(),
  )
