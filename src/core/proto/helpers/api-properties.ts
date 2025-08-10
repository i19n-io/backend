import { applyDecorators } from '@nestjs/common'
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger'
import { IsLocale, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator'

export const ApiPropertyLang = (options?: ApiPropertyOptions) =>
  applyDecorators(
    ApiProperty({
      format: 'BCP-47',
      minLength: 2,
      maxLength: 64,
      ...options,
    }),
    IsLocale(),
    IsString(),
    IsNotEmpty(),
    Length(2, 64),
  )

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
