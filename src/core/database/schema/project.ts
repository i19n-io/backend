import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { accountTable } from '~/core/database/schema/account'
import { withTimestamps } from '~/core/database/utils'

/** @todo Indexes for ordering */
export const projectTable = pgTable(
  'project',
  {
    id: uuid().primaryKey(),
    name: text().notNull(),
    // TODO: (lang) add reference to lang table
    defaultLang: text().notNull(),
    authorId: uuid()
      .references(() => accountTable.id, { onDelete: 'restrict' })
      .notNull(),
    ...withTimestamps,
  },
  t => [index().on(t.authorId)],
)

export type ProjectInsert = typeof projectTable.$inferInsert
export type ProjectSelect = typeof projectTable.$inferSelect
