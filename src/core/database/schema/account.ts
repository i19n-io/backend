import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { withTimestamps } from '~/core/database/utils'

export const accountTable = pgTable('account', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  email: text().unique(),
  avatar: text(),
  githubId: text().unique(),
  githubUsername: text(),
  ...withTimestamps,
})

export type AccountInsert = typeof accountTable.$inferInsert
export type AccountSelect = typeof accountTable.$inferSelect
