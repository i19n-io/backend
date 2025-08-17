export const toDate = (v: Date | string) => {
  if (v instanceof Date) return v
  if (typeof v === 'string') return new Date(v)
  // TODO: send log to monitoring system
  throw new Error('Invalid date')
}
