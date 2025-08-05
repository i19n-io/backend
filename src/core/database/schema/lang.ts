import type { InferSelectModel } from 'drizzle-orm'
import { index, pgTable, smallint, varchar } from 'drizzle-orm/pg-core'

export const lang = pgTable(
  'lang',
  {
    code: varchar({ length: 16 }).primaryKey(),
    nameEn: varchar({ length: 64 }).notNull(),
    nameNative: varchar({ length: 64 }).notNull(),
    rankSpeakers: smallint(),
    rankWeb: smallint(),
  },
  table => [index().on(table.rankSpeakers), index().on(table.rankWeb)],
)

export type LangInsert = typeof lang.$inferInsert
export type LangSelect = InferSelectModel<typeof lang>
