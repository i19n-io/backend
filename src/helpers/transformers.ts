import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'

export const TransformToInt = () =>
  applyDecorators(
    Transform(({ value }: { value: unknown }) => {
      if (typeof value !== 'string') return value
      const parsed = Number.parseInt(value, 10)
      return Number.isNaN(parsed) ? value : parsed
    }),
  )
