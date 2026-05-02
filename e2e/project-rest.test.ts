import { randomUUID } from 'node:crypto'

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

  describe('GET /projects/:id', () => {
    test('200 returns project with embedded author', async () => {
      const project = await makeProject(app, {
        name: 'project-rest-by-id',
        defaultLang: 'fr',
        authorId: account.id,
      })

      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}`,
      })

      expect(r.statusCode).toBe(200)
      expect(r.json()).toEqual(
        expect.objectContaining({
          id: project.id,
          name: 'project-rest-by-id',
          defaultLang: 'fr',
          authorId: account.id,
          author: expect.objectContaining({
            id: account.id,
            name: account.name,
          }),
        }),
      )
    })

    test('404 when id does not exist', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${randomUUID()}`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('400 when id is not a UUID', async () => {
      const r = await app.inject({
        method: 'GET',
        url: '/projects/not-a-uuid',
      })

      expect(r.statusCode).toBe(400)
    })
  })

  describe('POST /projects', () => {
    test('201 with created project including embedded author', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: {
          name: 'created-via-rest',
          defaultLang: 'en',
          authorId: account.id,
        },
      })

      expect(r.statusCode).toBe(201)
      expect(r.json()).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: 'created-via-rest',
          defaultLang: 'en',
          authorId: account.id,
          author: expect.objectContaining({
            id: account.id,
            name: account.name,
          }),
        }),
      )
    })

    test('404 when authorId does not exist', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: {
          name: 'orphan',
          defaultLang: 'en',
          authorId: randomUUID(),
        },
      })

      expect(r.statusCode).toBe(404)
    })

    test('400 when body is empty', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: {},
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when name is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: { defaultLang: 'en', authorId: account.id },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when name is empty', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: { name: '', defaultLang: 'en', authorId: account.id },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when defaultLang is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: { name: 'no-lang', authorId: account.id },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when defaultLang is not a valid locale', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: {
          name: 'bad-lang',
          defaultLang: 'not_a_locale!',
          authorId: account.id,
        },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when authorId is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: { name: 'no-author', defaultLang: 'en' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when authorId is not a UUID', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: {
          name: 'bad-author-uuid',
          defaultLang: 'en',
          authorId: 'not-a-uuid',
        },
      })

      expect(r.statusCode).toBe(400)
    })
  })
})
