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

/**
 * Accepts repeated query params (`?x=a&x=b`) and CSV (`?x=a,b`).
 * Empty values are dropped so `?x=` becomes `[]`.
 */
export const TransformToStringList = () =>
  applyDecorators(
    Transform(({ value }: { value: unknown }) => {
      if (Array.isArray(value)) return value as string[]
      if (typeof value !== 'string') return value
      return value.split(',').filter(Boolean)
    }),
  )
