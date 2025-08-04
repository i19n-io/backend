import { integer, pgTable } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 100_001 }),
})

export type UserInsert = typeof user.$inferInsert
export type UserSelect = typeof user.$inferSelect
