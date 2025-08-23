import {
  sql,
  type ColumnBaseConfig,
  type ColumnDataType,
  type SQL,
} from 'drizzle-orm'
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core'

import type { DatabaseService } from '~/core/database/database.service'

type IdColumn = PgColumn<
  ColumnBaseConfig<ColumnDataType, string> & {
    name: 'id'
    columnType: 'PgUUID'
    notNull: true
  }
>

type SortColumn = PgColumn<
  ColumnBaseConfig<ColumnDataType, string> & {
    name: 'sort'
    columnType: 'PgNumeric'
    notNull: true
  }
>
type Table = PgTableWithColumns<{
  name: string
  schema: string | undefined
  columns: { id: IdColumn; sort: SortColumn }
  dialect: 'pg'
}>

type Transaction = Parameters<Parameters<DatabaseService['transaction']>[0]>[0]

/**
 * Check if the gap between two values is too small.
 * Default min gap is 1e-12 for scale=12
 *
 * @example
 * ```
 * const prevItemSort = '0.001' // or undefined (if it's the first item)
 * const nextItemSort = '0.002' // or undefined (if it's the last item)
 *
 * const isTooSmall = await isGapTooSmall(
 *   tx,
 *   itemTable,
 *   prefItemSort,
 *   nextItemSort,
 * );
 * ```
 */
export const isGapTooSmall = async (
  tx: Transaction,
  table: Table,
  lo = '0',
  hi = '1',
  minGap = sql<number>`1e-12`,
) => {
  const [r] = await tx
    .select({ ok: sql<boolean>`${sql.raw(hi)} - ${sql.raw(lo)} > ${minGap}` })
    .from(table)
    .limit(1)

  return !r.ok
}

/**
 * Locally "stretch" the interval [lo, hi] to free up space
 */
export const ensureGapOrRebalance = async (
  tx: Transaction,
  table: Table,
  whereExpr: SQL,
  lo = '0',
  hi = '1',
  minGap = sql<number>`1e-12`,
  window = 50,
) => {
  const gapTooSmall = await isGapTooSmall(tx, table, lo, hi, minGap)
  if (!gapTooSmall) return

  const rows = await tx
    .select({ id: table.id })
    .from(table)
    .where(
      sql`
        ${whereExpr}
        AND ${table.sort} >= ${sql.raw(lo)}
        AND ${table.sort} <= ${sql.raw(hi)}
      `,
    )
    .orderBy(table.sort, table.id)
    .limit(Math.max(3, Math.min(200, window)))

  const n = rows.length
  if (n < 2) return

  for (let index = 0; index < n; index++) {
    const t = sql`${index + 1}::numeric / ${n + 1}::numeric`
    const sort = sql`${sql.raw(lo)} + ${t} * (${sql.raw(hi)} - ${sql.raw(lo)})`

    await tx
      .update(table)
      .set({ sort })
      .where(sql`${table.id} = ${rows[index].id}`)
  }
}

/**
 * Center between two numeric strings
 *
 * @example midExpr('1', '2') // → SQL<(1 + 2)::numeric / 2> → SQL<1.5>
 */
export const midExpr = (a: string, b: string) =>
  sql<number>`(${sql.raw(a)} + ${sql.raw(b)})::numeric / 2`

/**
 * (coalesce(MIN(sort), 1)) / 2
 *
 * @example sortExprStart(itemTable, sql`${itemTable.listId} = ${listId}`)
 */
export const sortExprStart = (table: Table, whereExpr: SQL) => {
  const minSubq = sql`
    (SELECT MIN(${table.sort})
     FROM ${table}
     WHERE ${whereExpr})
  `
  return sql<number>`(COALESCE(${minSubq}, 1))::numeric / 2`
}

/**
 * (coalesce(MAX(sort), 0) + 1) / 2
 *
 * @example sortExprEnd(itemTable, sql`${itemTable.listId} = ${listId}`)
 */
export const sortExprEnd = (table: Table, whereExpr: SQL) => {
  const maxSubq = sql`
    (SELECT MAX(${table.sort})
     FROM ${table}
     WHERE ${whereExpr})
  `
  return sql<number>`(COALESCE(${maxSubq}, 0) + 1)::numeric / 2`
}
