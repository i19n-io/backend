import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import {
  DatabaseService,
  projectTable,
  type ProjectSelect,
} from '~/core/database'

import { AccountService } from '~/account/account.service'
import type { Account } from '~/account/models'
import {
  Project,
  type ProjectCreate,
  type ProjectUpdate,
} from '~/project/models'

/** @todo Use universal result error type */
type ProjectCreateError = 'ALREADY_EXISTS'

/** @todo Use universal result type */
type ProjectCreateResult =
  | { ok: true; data: Project }
  | { ok: false; error: ProjectCreateError }

/** @todo Use universal result error type */
type ProjectUpdateStatus = 'UPDATED' | 'NOT_UPDATED'

/** @todo Use universal result error type */
type ProjectUpdateError = 'NOT_FOUND'

/** @todo Use universal result type */
type ProjectUpdateResult =
  | { ok: true; status: ProjectUpdateStatus; data: Project }
  | { ok: false; error: ProjectUpdateError }

@Injectable()
export class ProjectService {
  constructor(
    private readonly db: DatabaseService,
    private readonly accountService: AccountService,
  ) {}

  // TODO: implement pagination
  async findMany() {
    const r = await this.db.query.projectTable.findMany({
      // TODO: implement ordering with indexes
      orderBy: (t, { desc }) => desc(t.created),
    })

    return this.withAuthors(r)
  }

  async findOne(id: string) {
    const r = await this.db.query.projectTable.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    })

    if (r) return this.withAuthor(r)
  }

  async create(dto: ProjectCreate): Promise<ProjectCreateResult> {
    const r = await this.db
      .insert(projectTable)
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

    return { ok: true, data: await this.withAuthor(created) }
  }

  async update(id: string, dto: ProjectUpdate): Promise<ProjectUpdateResult> {
    const existing = await this.findOne(id)
    if (!existing) return { ok: false, error: 'NOT_FOUND' }

    const keys = Object.keys(dto) as Array<keyof ProjectUpdate>
    const hasConflicts = keys.some(key => existing[key] !== dto[key])

    if (!hasConflicts) {
      return { ok: true, status: 'NOT_UPDATED', data: existing }
    }

    const r = await this.db
      .update(projectTable)
      .set(dto)
      .where(eq(projectTable.id, id))
      .returning()

    const updated = r.at(0)
    if (!updated) {
      // TODO: send log to monitoring system
      return { ok: false, error: 'NOT_FOUND' }
    }

    return {
      ok: true,
      status: 'UPDATED',
      data: await this.withAuthor(updated),
    }
  }

  /** FK on project.author_id guarantees the row exists; throw otherwise. */
  private async withAuthor(row: ProjectSelect): Promise<Project> {
    const author = await this.accountService.findOneById(row.authorId)
    if (!author) {
      throw new Error(`Author ${row.authorId} missing for project ${row.id}`)
    }

    return new Project({ ...row, author })
  }

  private async withAuthors(rows: ProjectSelect[]): Promise<Project[]> {
    if (rows.length === 0) return []

    const unique = [...new Set(rows.map(r => r.authorId))]
    const authors = await this.accountService.findManyByIds(unique)
    const byId = new Map<string, Account>(authors.map(a => [a.id, a]))

    return rows.map(row => {
      const author = byId.get(row.authorId)
      if (!author) {
        throw new Error(`Author ${row.authorId} missing for project ${row.id}`)
      }
      return new Project({ ...row, author })
    })
  }
}
