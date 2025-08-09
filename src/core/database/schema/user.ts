import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  created: timestamp().defaultNow().notNull(),
  updated: timestamp().defaultNow().notNull(),
  deleted: timestamp(),
})

export type UserInsert = typeof userTable.$inferInsert
export type UserSelect = typeof userTable.$inferSelect
