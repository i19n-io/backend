import { equal } from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { sql, type SQL } from 'drizzle-orm'

import { DatabaseService, tokenKeyTable } from '~/core/database'
import { TokenKey, type TokenKeyListQuery } from '~/core/proto'
import type { TokenKeyCreate } from '~/core/proto/token-key-create'

type Transaction = Parameters<Parameters<DatabaseService['transaction']>[0]>[0]

/**
 * @todo Use universal result type
 */
type TokenKeyCreateResult = { ok: true; data: TokenKey } | { ok: false }

/** WHERE project_id = ? AND (parent_id = ? | IS NULL) */
const siblingsWhere = (projectId: string, parentId?: string) => {
  return sql`
    ${tokenKeyTable.projectId} = ${projectId}
    AND ${tokenKeyTable.parentId} ${parentId ? sql`= ${parentId}` : sql`IS NULL`}
  `
}

/** (coalesce(MIN(sort), 1)) / 2 */
const startSortExpr = (projectId: string, parentId?: string) => {
  const minSubq = sql`
    (SELECT MIN(${tokenKeyTable.sort})
     FROM ${tokenKeyTable}
     WHERE ${siblingsWhere(projectId, parentId)})
  `
  return sql`(COALESCE(${minSubq}, 1))::numeric / 2`
}

/** (coalesce(MAX(sort), 0) + 1) / 2 */
const endSortExpr = (projectId: string, parentId?: string) => {
  const maxSubq = sql`
    (SELECT MAX(${tokenKeyTable.sort})
     FROM ${tokenKeyTable}
     WHERE ${siblingsWhere(projectId, parentId)})
  `
  return sql`(COALESCE(${maxSubq}, 0) + 1)::numeric / 2`
}

/** center between two numeric strings */
const mid = (a: string, b: string) =>
  sql`(${sql.raw(a)} + ${sql.raw(b)})::numeric / 2`

/** is gap too small? (default 1e-12 for scale=12) */
const isGapTooSmall = async (
  tx: Transaction,
  lo: string,
  hi: string,
  minGap = sql<number>`1e-12`,
) => {
  const [r] = await tx
    .select({ ok: sql<boolean>`${sql.raw(hi)} - ${sql.raw(lo)} > ${minGap}` })
    .from(tokenKeyTable)
    .limit(1)
  return !r.ok
}

/** EN: locally "stretch" the interval [lo, hi] to free up space */
const ensureGapOrRebalance = async (
  tx: Transaction,
  parameters: {
    projectId: string
    parentId?: string
    lo: string
    hi: string
    minGap?: SQL<number>
    window?: number
  },
) => {
  const { projectId, parentId, lo, hi, minGap, window } = parameters

  const gapTooSmall = await isGapTooSmall(tx, lo, hi, minGap)
  if (!gapTooSmall) return

  const rows = await tx
    .select({ id: tokenKeyTable.id })
    .from(tokenKeyTable)
    .where(
      sql`
        ${siblingsWhere(projectId, parentId)}
        AND ${tokenKeyTable.sort} >= ${sql.raw(lo)}
        AND ${tokenKeyTable.sort} <= ${sql.raw(hi)}
      `,
    )
    .orderBy(tokenKeyTable.sort, tokenKeyTable.id)
    .limit(Math.max(3, Math.min(200, window ?? 50)))

  const n = rows.length
  if (n < 2) return

  for (let index = 0; index < n; index++) {
    const t = sql`${index + 1}::numeric / ${n + 1}::numeric`
    const sort = sql`${sql.raw(lo)} + ${t} * (${sql.raw(hi)} - ${sql.raw(lo)})`

    await tx
      .update(tokenKeyTable)
      .set({ sort })
      .where(sql`${tokenKeyTable.id} = ${rows[index].id}`)
  }
}

/**
 * Universal insertion of `token_key`:
 * - `start` — at the beginning of siblings
 * - `end` — at the end of siblings
 * - `after` — between `afterId` and its next neighbor; if there is no neighbor — at the end
 */
export async function insertTokenKey(
  db: DatabaseService,
  projectId: string,
  dto: TokenKeyCreate,

  // optionally: control over density and volume of rebalancing
  minGap?: SQL<number>, // default: sql`1e-12`
  window?: number, // default: 50
) {
  const { parentId, key, position } = dto

  if (position === 'start') {
    const [row] = await db
      .insert(tokenKeyTable)
      .values({
        id: randomUUID(),
        projectId,
        parentId,
        key,
        sort: startSortExpr(projectId, parentId),
      })
      .onConflictDoNothing()
      .returning()

    return row
  }

  if (position === 'end') {
    const [row] = await db
      .insert(tokenKeyTable)
      .values({
        id: randomUUID(),
        projectId,
        parentId,
        key,
        sort: endSortExpr(projectId, parentId),
      })
      .onConflictDoNothing()
      .returning()

    return row
  }

  // Just to make sure...
  equal(position, 'after', new Error(`Invalid position: ${position}`))

  const { afterId } = dto
  if (!afterId) throw new Error('Parameter `afterId` is required')

  return db.transaction(async tx => {
    const currentResult = await tx
      .select()
      .from(tokenKeyTable)
      .where(
        sql`
          ${siblingsWhere(projectId, parentId)}
          AND ${tokenKeyTable.id} = ${afterId}
        `,
      )
      .limit(1)

    const current = currentResult.at(0)
    if (!current) throw new Error('`afterId` not found')

    const nextResult = await tx
      .select({ id: tokenKeyTable.id, sort: tokenKeyTable.sort })
      .from(tokenKeyTable)
      .where(
        sql`
          ${siblingsWhere(projectId, parentId)}
          AND (${tokenKeyTable.sort}, ${tokenKeyTable.id}) > (${sql.raw(current.sort)}, ${afterId})
        `,
      )
      .orderBy(tokenKeyTable.sort, tokenKeyTable.id)
      .limit(1)

    const next = nextResult.at(0)

    if (!next) {
      const result = await tx
        .insert(tokenKeyTable)
        .values({
          id: randomUUID(),
          projectId,
          parentId,
          key,
          sort: sql`(${sql.raw(current.sort)} + 1)::numeric / 2`,
        })
        .onConflictDoNothing()
        .returning()

      return result.at(0)
    }

    await ensureGapOrRebalance(tx, {
      projectId,
      parentId,
      lo: current.sort,
      hi: next.sort,
      minGap,
      window,
    })

    const result = await tx
      .insert(tokenKeyTable)
      .values({
        id: randomUUID(),
        projectId,
        parentId,
        key,
        sort: mid(current.sort, next.sort),
      })
      .onConflictDoNothing()
      .returning()

    return result.at(0)
  })
}

@Injectable()
export class TokenService {
  constructor(private readonly db: DatabaseService) {}

  async findMany({ projectId, parentId, limit, offset }: TokenKeyListQuery) {
    const r = await this.db.query.tokenKeyTable.findMany({
      where: (t, { and, eq, isNull }) =>
        and(
          eq(t.projectId, projectId),
          parentId ? eq(t.parentId, parentId) : isNull(t.parentId),
        ),
      orderBy: (t, { asc }) => [asc(t.sort), asc(t.id)],
      limit,
      offset,
    })

    return r.map(v => new TokenKey(v))
  }

  async findOne(projectId: string, id: string) {
    const r = await this.db.query.tokenKeyTable.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, id), eq(t.projectId, projectId)),
    })

    return r ? new TokenKey(r) : undefined
  }

  async create(
    projectId: string,
    dto: TokenKeyCreate,
  ): Promise<TokenKeyCreateResult> {
    const data = await insertTokenKey(this.db, projectId, dto)

    return data ? { ok: true, data: new TokenKey(data) } : { ok: false }
  }
}
