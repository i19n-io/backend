import { applyDecorators } from '@nestjs/common'
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator'

export const IsIntBetween = (min: number, max: number) =>
  applyDecorators(IsNotEmpty(), IsInt(), Min(min), Max(max))
