import { sql } from 'drizzle-orm'
import {
  check,
  foreignKey,
  index,
  numeric,
  pgTable,
  text,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

import { projectTable } from '~/core/database/schema/project'

export const tokenKeyTable = pgTable(
  'token_key',
  {
    id: uuid().primaryKey(),
    projectId: uuid()
      .references(() => projectTable.id, { onDelete: 'restrict' })
      .notNull(),
    parentId: uuid(),
    key: text().notNull(),
    sort: numeric({ precision: 13, scale: 12 }).notNull(),
  },
  t => [
    // Uniqueness constraints
    unique().on(t.projectId, t.parentId, t.key).nullsNotDistinct(),

    // Stable composite uniqueness for self-reference
    // unique('token_key_projectId_id_unique').on(t.projectId, t.id),
    unique('token_key_project_id_id_unique').on(t.projectId, t.id),
    foreignKey({
      columns: [t.projectId, t.parentId],
      foreignColumns: [t.projectId, t.id],
    }).onDelete('cascade'),

    // Keep inside 0 and 1 to avoid hitting boundaries and simplify math
    check('token_key_check_sort_0_1', sql`${t.sort} > 0 AND ${t.sort} < 1`),

    // Performance optimization
    index().on(t.projectId, t.parentId, t.sort, t.id),
  ],
)

export type TokenKeyInsert = typeof tokenKeyTable.$inferInsert
export type TokenKeySelect = typeof tokenKeyTable.$inferSelect
