import { randomUUID } from 'node:crypto'

import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import type { Project } from '~/project/models'
import type { TokenKey } from '~/token/models'

import {
  createTestApp,
  makeAccount,
  makeProject,
  makeTokenKey,
} from '~/e2e/helpers'

describe('TokenKey (REST)', () => {
  let app: NestFastifyApplication
  let project: Project

  beforeAll(async () => {
    app = await createTestApp()
    const account = await makeAccount(app)
    project = await makeProject(app, {
      name: 'TokenKey REST test project',
      authorId: account.id,
    })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /projects/:projectId/token-keys', () => {
    let topA: TokenKey
    let topB: TokenKey
    let childA1: TokenKey
    let childA2: TokenKey

    beforeAll(async () => {
      topA = await makeTokenKey(app, project.id, { key: 'top-a' })
      topB = await makeTokenKey(app, project.id, { key: 'top-b' })
      childA1 = await makeTokenKey(app, project.id, {
        key: 'child-1',
        parentId: topA.id,
      })
      childA2 = await makeTokenKey(app, project.id, {
        key: 'child-2',
        parentId: topA.id,
      })
    })

    test('200 returns every key in project when no parentId', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}/token-keys`,
      })

      expect(r.statusCode).toBe(200)
      const body = r.json<TokenKey[]>()
      const ids = body.map(k => k.id).sort()
      expect(ids).toEqual([topA.id, topB.id, childA1.id, childA2.id].sort())
    })

    test('200 returns only top-level keys when parentId=null', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}/token-keys?parentId=null`,
      })

      expect(r.statusCode).toBe(200)
      const body = r.json<TokenKey[]>()
      const ids = body.map(k => k.id).sort()
      expect(ids).toEqual([topA.id, topB.id].sort())
      expect(body.every(k => k.parentId === undefined)).toBe(true)
    })

    test('200 returns only top-level keys when parentId is empty', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}/token-keys?parentId=`,
      })

      expect(r.statusCode).toBe(200)
      const body = r.json<TokenKey[]>()
      const ids = body.map(k => k.id).sort()
      expect(ids).toEqual([topA.id, topB.id].sort())
    })

    test('200 returns children when parentId=<uuid>', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}/token-keys?parentId=${topA.id}`,
      })

      expect(r.statusCode).toBe(200)
      const body = r.json<TokenKey[]>()
      const ids = body.map(k => k.id).sort()
      expect(ids).toEqual([childA1.id, childA2.id].sort())
      expect(body.every(k => k.parentId === topA.id)).toBe(true)
    })

    test('200 returns empty array when parent has no children', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}/token-keys?parentId=${topB.id}`,
      })

      expect(r.statusCode).toBe(200)
      expect(r.json()).toEqual([])
    })

    test('200 returns empty array when project has no keys', async () => {
      const account = await makeAccount(app)
      const empty = await makeProject(app, {
        name: 'empty project',
        authorId: account.id,
      })

      const r = await app.inject({
        method: 'GET',
        url: `/projects/${empty.id}/token-keys`,
      })

      expect(r.statusCode).toBe(200)
      expect(r.json()).toEqual([])
    })

    test('404 when project does not exist', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${randomUUID()}/token-keys`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('400 when projectId is not a UUID', async () => {
      const r = await app.inject({
        method: 'GET',
        url: '/projects/not-a-uuid/token-keys',
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when parentId is not a UUID and not "null"', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}/token-keys?parentId=banana`,
      })

      expect(r.statusCode).toBe(400)
    })
  })

  describe('GET /projects/:projectId/token-keys/:id', () => {
    let key: TokenKey

    beforeAll(async () => {
      key = await makeTokenKey(app, project.id, { key: 'lookup' })
    })

    test('200 returns the key when present in project', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}/token-keys/${key.id}`,
      })

      expect(r.statusCode).toBe(200)
      expect(r.json()).toEqual({
        id: key.id,
        projectId: project.id,
        key: 'lookup',
      })
    })

    test('404 when id does not exist', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}/token-keys/${randomUUID()}`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('404 when key belongs to a different project', async () => {
      const account = await makeAccount(app)
      const otherProject = await makeProject(app, {
        name: 'other project',
        authorId: account.id,
      })

      const r = await app.inject({
        method: 'GET',
        url: `/projects/${otherProject.id}/token-keys/${key.id}`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('404 when projectId does not exist', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${randomUUID()}/token-keys/${key.id}`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('400 when projectId is not a UUID', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/not-a-uuid/token-keys/${key.id}`,
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when id is not a UUID', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/projects/${project.id}/token-keys/not-a-uuid`,
      })

      expect(r.statusCode).toBe(400)
    })
  })

  describe('POST /projects/:projectId/token-keys', () => {
    let postProject: Project

    beforeAll(async () => {
      const account = await makeAccount(app)
      postProject = await makeProject(app, {
        name: 'POST token-keys project',
        authorId: account.id,
      })
    })

    test('201 with position=end at top level', async ({ task }) => {
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: { key: `end_${task.id}`, position: 'end' },
      })

      expect(r.statusCode).toBe(201)
      expect(r.json()).toEqual({
        id: expect.any(String),
        projectId: postProject.id,
        key: `end_${task.id}`,
      })
    })

    test('201 with position=start at top level', async ({ task }) => {
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: { key: `start_${task.id}`, position: 'start' },
      })

      expect(r.statusCode).toBe(201)
    })

    test('201 with position=after using a sibling', async ({ task }) => {
      const sibling = await makeTokenKey(app, postProject.id, {
        key: `sibling_${task.id}`,
      })

      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: {
          key: `after_${task.id}`,
          position: 'after',
          afterId: sibling.id,
        },
      })

      expect(r.statusCode).toBe(201)
    })

    test('201 with parentId creates a child', async ({ task }) => {
      const parent = await makeTokenKey(app, postProject.id, {
        key: `parent_${task.id}`,
      })

      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: {
          key: `child_${task.id}`,
          position: 'end',
          parentId: parent.id,
        },
      })

      expect(r.statusCode).toBe(201)
      expect(r.json()).toEqual({
        id: expect.any(String),
        projectId: postProject.id,
        parentId: parent.id,
        key: `child_${task.id}`,
      })
    })

    test('multiple position=end keep insertion order', async ({ task }) => {
      const account = await makeAccount(app)
      const p = await makeProject(app, {
        name: `order_${task.id}`,
        authorId: account.id,
      })

      const labels = ['a', 'b', 'c']
      for (const label of labels) {
        const r = await app.inject({
          method: 'POST',
          url: `/projects/${p.id}/token-keys`,
          payload: { key: label, position: 'end' },
        })
        expect(r.statusCode).toBe(201)
      }

      const list = await app.inject({
        method: 'GET',
        url: `/projects/${p.id}/token-keys?parentId=null`,
      })
      expect(list.statusCode).toBe(200)
      expect(list.json<TokenKey[]>().map(k => k.key)).toEqual(labels)
    })

    test('404 when project does not exist', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${randomUUID()}/token-keys`,
        payload: { key: 'orphan', position: 'end' },
      })
      expect(r.statusCode).toBe(404)
    })

    test('404 when parentId does not exist in project', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: {
          key: 'child-of-ghost',
          position: 'end',
          parentId: randomUUID(),
        },
      })
      expect(r.statusCode).toBe(404)
    })

    test('404 when parentId belongs to a different project', async () => {
      const account = await makeAccount(app)
      const otherProject = await makeProject(app, {
        name: 'other-for-parent-check',
        authorId: account.id,
      })
      const otherKey = await makeTokenKey(app, otherProject.id, { key: 'foo' })

      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: {
          key: 'cross-project-child',
          position: 'end',
          parentId: otherKey.id,
        },
      })
      expect(r.statusCode).toBe(404)
    })

    test('409 on duplicate key at the same parent level', async ({ task }) => {
      const payload = { key: `dup_${task.id}`, position: 'end' as const }

      const first = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload,
      })
      expect(first.statusCode).toBe(201)

      const second = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload,
      })
      expect(second.statusCode).toBe(409)
    })

    test('400 when afterId does not match a sibling', async ({ task }) => {
      const otherParent = await makeTokenKey(app, postProject.id, {
        key: `parent-x_${task.id}`,
      })
      const childOfOther = await makeTokenKey(app, postProject.id, {
        key: `child-x_${task.id}`,
        parentId: otherParent.id,
      })

      // child of `otherParent` is not a sibling at top level
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: {
          key: `bad-after_${task.id}`,
          position: 'after',
          afterId: childOfOther.id,
        },
      })
      expect(r.statusCode).toBe(400)
    })

    test('400 when position is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: { key: 'no-position' },
      })
      expect(r.statusCode).toBe(400)
    })

    test('400 when position is invalid', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: { key: 'bad-position', position: 'middle' },
      })
      expect(r.statusCode).toBe(400)
    })

    test('400 when position=after but afterId is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: { key: 'no-afterId', position: 'after' },
      })
      expect(r.statusCode).toBe(400)
    })

    test('400 when key is empty', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: { key: '', position: 'end' },
      })
      expect(r.statusCode).toBe(400)
    })

    test('400 when projectId is not a UUID', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/projects/not-a-uuid/token-keys',
        payload: { key: 'whatever', position: 'end' },
      })
      expect(r.statusCode).toBe(400)
    })

    test('400 when parentId is not a UUID', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/projects/${postProject.id}/token-keys`,
        payload: { key: 'bad-parent', position: 'end', parentId: 'nope' },
      })
      expect(r.statusCode).toBe(400)
    })
  })
})
