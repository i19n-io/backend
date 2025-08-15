import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import {
  accountTable,
  DatabaseService,
  type AccountSelect,
} from '~/core/database'
import type { AccountCreate } from '~/core/proto'

/**
 * @todo Use universal result error type
 */
type AccountCreateError = 'ALREADY_EXISTS'

/**
 * @todo Use universal result type
 */
type AccountCreateResult =
  | { ok: true; data: AccountSelect }
  | { ok: false; error: AccountCreateError }

@Injectable()
export class AccountService {
  constructor(private readonly db: DatabaseService) {}

  findOneById(id: string) {
    return this.db.query.accountTable.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    })
  }

  /**
   * @todo Return `Account` model`
   */
  findOneByGithubId(id: string) {
    return this.db.query.accountTable.findFirst({
      where: (t, { eq }) => eq(t.githubId, id),
    })
  }

  /**
   * @todo Return `Account` model in `data`
   */
  async create(dto: AccountCreate): Promise<AccountCreateResult> {
    const r = await this.db
      .insert(accountTable)
      .values({
        id: randomUUID(),
        ...dto, // eslint-disable-line @typescript-eslint/no-misused-spread
      })
      .onConflictDoNothing()
      .returning()

    const data = r.at(0)

    return data ? { ok: true, data } : { ok: false, error: 'ALREADY_EXISTS' }
  }
}
