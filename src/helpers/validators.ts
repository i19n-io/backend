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
} from 'class-validator'

export const ValidateAsIntBetween = (min: number, max: number) =>
  applyDecorators(IsNotEmpty(), IsInt(), Min(min), Max(max))

export const ValidateAsLang = () =>
  applyDecorators(
    IsString({ message: '$property → Must be a string' }),
    IsNotEmpty({ message: '$property → Should not be empty' }),
    IsLocale({ message: '$property → Must be locale' }),
    Length(2, 64, {
      message: '$property → Must be between 2 and 64 characters long',
    }),
  )

export const ValidateAsUuid = () =>
  applyDecorators(
    IsString({ message: '$property → Must be a string' }),
    IsNotEmpty({ message: '$property → Should not be empty' }),
    IsUUID(4, { message: '$property → Must be a UUID' }),
  )
