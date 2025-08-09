import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import { DatabaseService, type UserSelect, userTable } from '~/core/database'
import type { UserCreate } from '~/core/proto/user-create'

/**
 * @todo Use universal result error type
 */
type UserCreateError = 'ALREADY_EXISTS'

/**
 * @todo Use universal result type
 */
type UserCreateResult =
  | { ok: true; data: UserSelect }
  | { ok: false; error: UserCreateError }

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: UserCreate): Promise<UserCreateResult> {
    const r = await this.db
      .insert(userTable)
      .values({
        id: randomUUID(),
        name: dto.name,
      })
      .onConflictDoNothing()
      .returning()

    const data = r.at(0)

    return data ? { ok: true, data } : { ok: false, error: 'ALREADY_EXISTS' }
  }
}
