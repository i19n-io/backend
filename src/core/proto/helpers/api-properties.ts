import { applyDecorators } from '@nestjs/common'
import {
  ApiProperty,
  ApiPropertyOptional,
  type ApiPropertyOptions,
} from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { ValidateAsUuid } from '~/helpers/validators'

const uuidOptions = (options?: ApiPropertyOptions): ApiPropertyOptions => ({
  format: 'uuid',
  minLength: 36,
  maxLength: 36,
  ...options,
})

export const ApiPropertyUuid = (options?: ApiPropertyOptions) =>
  applyDecorators(ApiProperty(uuidOptions(options)), ValidateAsUuid())

export const ApiPropertyUuidOptional = (options?: ApiPropertyOptions) =>
  applyDecorators(
    ApiPropertyOptional(uuidOptions(options)),
    IsOptional(),
    ValidateAsUuid(),
  )
