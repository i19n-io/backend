import { ok } from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import { DatabaseService, tokenValueTable } from '~/core/database'

import { TokenValue, TokenValueCreate } from '~/token/models'

/** @todo Use universal result error type */
type TokenValueCreateError = 'ALREADY_EXISTS'

/** @todo Use universal result type */
type TokenValueCreateResult =
  | { ok: true; data: TokenValue }
  | { ok: false; error: TokenValueCreateError }

@Injectable()
export class TokenValueService {
  constructor(private readonly db: DatabaseService) {}

  async findMany({ keyId, langs }: { keyId: string; langs?: string[] }) {
    if (langs?.length === 1) {
      const lang = langs.at(0)
      // TODO: send log to monitoring system
      ok(lang, 'At least one language must be defined')

      const r = await this.findOne(keyId, lang)
      return r ? [r] : []
    }

    const r = await this.db.query.tokenValueTable.findMany({
      where: (t, { and, eq, inArray }) =>
        and(
          eq(t.keyId, keyId),
          langs?.length ? inArray(t.lang, langs) : undefined,
        ),
      // TODO: order by project languages (default lang first)
      orderBy: (t, { asc }) => [asc(t.lang)],
    })

    return r.map(v => new TokenValue(v))
  }

  async findOneById(id: string) {
    const r = await this.db.query.tokenValueTable.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    })

    if (r) return new TokenValue(r)
  }

  async findOne(keyId: string, lang: string) {
    const r = await this.db.query.tokenValueTable.findFirst({
      where: (t, { eq, and }) => and(eq(t.keyId, keyId), eq(t.lang, lang)),
    })

    if (r) return new TokenValue(r)
  }

  async create(
    keyId: string,
    dto: TokenValueCreate,
  ): Promise<TokenValueCreateResult> {
    const r = await this.db
      .insert(tokenValueTable)
      .values({
        id: randomUUID(),
        keyId,
        ...dto, // eslint-disable-line @typescript-eslint/no-misused-spread
      })
      .onConflictDoNothing()
      .returning()

    const created = r.at(0)
    if (!created) {
      // TODO: send log to monitoring system
      return { ok: false, error: 'ALREADY_EXISTS' }
    }

    return { ok: true, data: new TokenValue(created) }
  }
}
