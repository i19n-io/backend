import { ok } from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import {
  accountTable,
  DatabaseService,
  type AccountSelect,
} from '~/core/database'

import { Account, type AccountCreate } from '~/account/models'

/** @todo Use universal result error type */
type AccountCreateError = 'ALREADY_EXISTS'

/** @todo Use universal result error type */
type AccountCreateResult =
  | { ok: true; data: Account }
  | { ok: false; error: AccountCreateError }

@Injectable()
export class AccountService {
  constructor(private readonly db: DatabaseService) {}

  async findOneById(id: string) {
    const r = await this.db.query.accountTable.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    })

    return r ? new Account(r) : undefined
  }

  async findOneByGithubId(id: string) {
    const r = await this.db.query.accountTable.findFirst({
      where: (t, { eq }) => eq(t.githubId, id),
    })

    return r ? new Account(r) : undefined
  }

  async findManyByIds(ids: string[]) {
    const queryBuilder = this.db.query.accountTable

    let r: AccountSelect[]

    if (ids.length > 1) {
      r = await queryBuilder.findMany({
        where: (t, { inArray }) => inArray(t.id, ids),
      })
    } else {
      const id = ids.at(0)
      // TODO: send log to monitoring system
      ok(id, 'Account ID must be defined')

      r = await queryBuilder.findMany({
        where: (t, { eq }) => eq(t.id, id),
      })
    }

    return r.map(item => new Account(item))
  }

  async create(dto: AccountCreate): Promise<AccountCreateResult> {
    const r = await this.db
      .insert(accountTable)
      .values({
        id: randomUUID(),
        ...dto, // eslint-disable-line @typescript-eslint/no-misused-spread
      })
      .onConflictDoNothing()
      .returning()

    const created = r.at(0)
    if (!created) {
      // TODO: send log to monitoring system
      return { ok: false, error: 'ALREADY_EXISTS' }
    }

    return { ok: true, data: new Account(created) }
  }
}
