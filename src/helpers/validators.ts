import { applyDecorators } from '@nestjs/common'
import {
  IsInt,
  IsLocale,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  type ValidationOptions,
} from 'class-validator'

export const ValidateAsIntBetween = (min: number, max: number) =>
  applyDecorators(IsNotEmpty(), IsInt(), Min(min), Max(max))

export const ValidateAsLang = (options?: ValidationOptions) =>
  applyDecorators(
    IsString({ ...options, message: '$property → Must be a string' }),
    IsNotEmpty({ ...options, message: '$property → Should not be empty' }),
    IsLocale({ ...options, message: '$property → Must be locale' }),
    Length(2, 64, {
      ...options,
      message: '$property → Must be between 2 and 64 characters long',
    }),
  )

export const ValidateAsUuid = (options?: ValidationOptions) =>
  applyDecorators(
    IsString({ ...options, message: '$property → Must be a string' }),
    IsNotEmpty({ ...options, message: '$property → Should not be empty' }),
    IsUUID(4, { ...options, message: '$property → Must be a UUID' }),
  )
