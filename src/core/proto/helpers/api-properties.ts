import { applyDecorators } from '@nestjs/common'
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export const ApiPropertyUuid = (options?: ApiPropertyOptions) =>
  applyDecorators(
    ApiProperty({
      format: 'uuid',
      minLength: 36,
      maxLength: 36,
      ...options,
    }),
    IsUUID(4),
  )
