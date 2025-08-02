import { integer, pgTable } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 100_001 }),
})

export type UserInsert = typeof users.$inferInsert
export type UserSelect = typeof users.$inferSelect
