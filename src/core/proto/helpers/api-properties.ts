import {
  ApiProperty,
  ApiPropertyOptional,
  type ApiPropertyOptions,
} from '@nestjs/swagger'

export const ApiPropertyUuid = (options?: ApiPropertyOptions) =>
  ApiProperty({
    format: 'uuid',
    minLength: 36,
    maxLength: 36,
    ...options,
  })

export const ApiPropertyUuidOptional = (options?: ApiPropertyOptions) =>
  ApiPropertyOptional({
    format: 'uuid',
    minLength: 36,
    maxLength: 36,
    ...options,
  })
