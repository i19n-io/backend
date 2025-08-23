import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { tokenKeyTable } from '~/core/database/schema/token-key'

export const tokenValueTable = pgTable(
  'token_value',
  {
    id: uuid().primaryKey(),
    keyId: uuid()
      .references(() => tokenKeyTable.id, { onDelete: 'cascade' })
      .notNull(),
    lang: text().notNull(),
    value: text().notNull(),
  },
  t => [
    // Uniqueness constraints and performance optimization
    uniqueIndex().on(t.keyId, t.lang),
  ],
)

export type TokenValueInsert = typeof tokenValueTable.$inferInsert
export type TokenValueSelect = typeof tokenValueTable.$inferSelect
