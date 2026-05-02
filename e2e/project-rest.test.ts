import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import type { Account } from '~/account/models'
import type { Project } from '~/project/models'

import { createTestApp, makeAccount, makeProject } from '~/e2e/helpers'

describe('Project (REST)', () => {
  let app: NestFastifyApplication
  let account: Account

  beforeAll(async () => {
    app = await createTestApp()
    account = await makeAccount(app, { name: 'Author One' })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /projects', () => {
    test('200 with project list including embedded author', async () => {
      const project = await makeProject(app, {
        name: 'project-rest-list',
        defaultLang: 'en',
        authorId: account.id,
      })

      const r = await app.inject({ method: 'GET', url: '/projects' })
      expect(r.statusCode).toBe(200)

      const body = r.json<Project[]>()
      const found = body.find(p => p.id === project.id)
      expect(found).toBeDefined()
      expect(found).toEqual(
        expect.objectContaining({
          id: project.id,
          name: 'project-rest-list',
          defaultLang: 'en',
          authorId: account.id,
          author: expect.objectContaining({
            id: account.id,
            name: 'Author One',
          }),
        }),
      )
    })

    test('list is ordered by created desc (newest first)', async () => {
      const a = await makeProject(app, {
        name: 'order-A',
        authorId: account.id,
      })
      const b = await makeProject(app, {
        name: 'order-B',
        authorId: account.id,
      })

      const r = await app.inject({ method: 'GET', url: '/projects' })
      expect(r.statusCode).toBe(200)

      const body = r.json<Project[]>()
      const indexA = body.findIndex(p => p.id === a.id)
      const indexB = body.findIndex(p => p.id === b.id)
      expect(indexA).toBeGreaterThanOrEqual(0)
      expect(indexB).toBeGreaterThanOrEqual(0)
      expect(indexB).toBeLessThan(indexA)
    })

    test('embeds different authors for projects from different accounts', async () => {
      const otherAccount = await makeAccount(app, { name: 'Author Two' })
      const p1 = await makeProject(app, {
        name: 'multi-author-1',
        authorId: account.id,
      })
      const p2 = await makeProject(app, {
        name: 'multi-author-2',
        authorId: otherAccount.id,
      })

      const r = await app.inject({ method: 'GET', url: '/projects' })
      const body = r.json<Project[]>()

      const found1 = body.find(p => p.id === p1.id)
      const found2 = body.find(p => p.id === p2.id)
      expect(found1?.author.id).toBe(account.id)
      expect(found2?.author.id).toBe(otherAccount.id)
    })
  })
})
