import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import { DatabaseService, projectTable } from '~/core/database'
import { Project, type PaginationQuery, type ProjectCreate } from '~/core/proto'

/**
 * @todo Use universal result type
 */
type ProjectCreateResult = { ok: true; data: Project } | { ok: false }

@Injectable()
export class ProjectService {
  constructor(private readonly db: DatabaseService) {}

  async findMany({ limit, offset }: PaginationQuery) {
    const r = await this.db.query.projectTable.findMany({
      orderBy: (t, { desc }) => desc(t.created),
      limit,
      offset,
    })

    return r.map(v => new Project(v))
  }

  async findOne(id: string) {
    const r = await this.db.query.projectTable.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    })

    return r ? new Project(r) : undefined
  }

  async create(dto: ProjectCreate): Promise<ProjectCreateResult> {
    const r = await this.db
      .insert(projectTable)
      .values({
        id: randomUUID(),
        name: dto.name,
        defaultLang: dto.defaultLang,
        authorId: dto.authorId,
      })
      .onConflictDoNothing()
      .returning()

    const data = r.at(0)

    return data ? { ok: true, data: new Project(data) } : { ok: false }
  }
}
