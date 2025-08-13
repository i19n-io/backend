import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  created: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated: timestamp({ withTimezone: true }).defaultNow().notNull(),
  deleted: timestamp({ withTimezone: true }),
})

export type UserInsert = typeof userTable.$inferInsert
export type UserSelect = typeof userTable.$inferSelect
