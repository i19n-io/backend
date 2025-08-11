import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { userTable } from '~/core/database/schema/user'

export const projectTable = pgTable(
  'project',
  {
    id: uuid().primaryKey(),
    name: text().notNull(),
    // TODO: (lang) add reference to lang table
    defaultLang: text().notNull(),
    authorId: uuid().references(() => userTable.id, { onDelete: 'restrict' }),
    created: timestamp().defaultNow().notNull(),
    updated: timestamp().defaultNow().notNull(),
    deleted: timestamp(),
  },
  t => [index().on(t.authorId)],
)

export type ProjectInsert = typeof projectTable.$inferInsert
export type ProjectSelect = typeof projectTable.$inferSelect
