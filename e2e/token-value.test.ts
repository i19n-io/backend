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
  makeTokenValue,
} from '~/e2e/helpers'

describe('TokenValue (REST)', () => {
  let app: NestFastifyApplication
  let project: Project

  beforeAll(async () => {
    app = await createTestApp()

    const account = await makeAccount(app)
    project = await makeProject(app, {
      name: 'TokenValue REST test project',
      authorId: account.id,
    })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /tokens/keys/:keyId/values', () => {
    let key: TokenKey

    beforeAll(async () => {
      key = await makeTokenKey(app, project.id, { key: 'farewell' })
      await makeTokenValue(app, key.id, { lang: 'en', value: 'english value' })
      await makeTokenValue(app, key.id, { lang: 'fr', value: 'french value' })
      await makeTokenValue(app, key.id, { lang: 'de', value: 'german value' })
    })

    test('200 with all values when no langs filter', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${key.id}/values?project=${project.id}`,
      })

      expect(r.statusCode).toBe(200)

      const body = r.json<unknown[]>()
      expect(body).toHaveLength(3)
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyId: key.id,
            lang: 'en',
            value: 'english value',
          }),
          expect.objectContaining({
            keyId: key.id,
            lang: 'fr',
            value: 'french value',
          }),
          expect.objectContaining({
            keyId: key.id,
            lang: 'de',
            value: 'german value',
          }),
        ]),
      )
    })

    test('200 filtered by comma-separated langs', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${key.id}/values?project=${project.id}&langs=en,fr`,
      })

      expect(r.statusCode).toBe(200)
      const body = r.json<{ lang: string }[]>()
      expect(body).toHaveLength(2)
      expect(body.map(v => v.lang).sort()).toEqual(['en', 'fr'])
    })

    test('200 filtered by repeated langs param', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${key.id}/values?project=${project.id}&langs=en&langs=de`,
      })

      expect(r.statusCode).toBe(200)
      const body = r.json<{ lang: string }[]>()
      expect(body).toHaveLength(2)
      expect(body.map(v => v.lang).sort()).toEqual(['de', 'en'])
    })

    test('200 with single lang returns one-item array', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${key.id}/values?project=${project.id}&langs=fr`,
      })

      expect(r.statusCode).toBe(200)
      const body = r.json<{ lang: string }[]>()
      expect(body).toEqual([
        expect.objectContaining({ lang: 'fr', value: 'french value' }),
      ])
    })

    test('200 empty array when key has no values', async () => {
      const empty = await makeTokenKey(app, project.id, { key: 'empty' })
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${empty.id}/values?project=${project.id}`,
      })

      expect(r.statusCode).toBe(200)
      expect(r.json()).toEqual([])
    })

    test('404 when keyId does not exist in project', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${randomUUID()}/values?project=${project.id}`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('404 when key belongs to another project', async () => {
      const otherAccount = await makeAccount(app)
      const otherProject = await makeProject(app, {
        name: 'other-for-cross-check',
        authorId: otherAccount.id,
      })

      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${key.id}/values?project=${otherProject.id}`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('400 when project is missing', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${key.id}/values`,
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when project is not a UUID', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${key.id}/values?project=not-a-uuid`,
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when keyId is not a UUID', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/not-a-uuid/values?project=${project.id}`,
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when langs contains invalid locale', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/tokens/keys/${key.id}/values?project=${project.id}&langs=en,not_a_locale!`,
      })

      expect(r.statusCode).toBe(400)
    })
  })

  describe('POST /tokens/keys/:keyId/values', () => {
    let key: TokenKey

    beforeAll(async () => {
      key = await makeTokenKey(app, project.id, { key: 'creation' })
    })

    test('201 with created value', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${key.id}/values?project=${project.id}`,
        payload: { lang: 'en', value: 'created en' },
      })

      expect(r.statusCode).toBe(201)
      expect(r.json()).toEqual({
        id: expect.any(String),
        keyId: key.id,
        lang: 'en',
        value: 'created en',
      })
    })

    test('409 on duplicate (keyId, lang)', async () => {
      const k = await makeTokenKey(app, project.id, { key: 'dup-create' })
      await makeTokenValue(app, k.id, { lang: 'en', value: 'first' })

      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${k.id}/values?project=${project.id}`,
        payload: { lang: 'en', value: 'second' },
      })

      expect(r.statusCode).toBe(409)
    })

    test('404 when keyId does not exist', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${randomUUID()}/values?project=${project.id}`,
        payload: { lang: 'en', value: 'orphan' },
      })

      expect(r.statusCode).toBe(404)
    })

    test('404 when key belongs to another project', async () => {
      const otherAccount = await makeAccount(app)
      const otherProject = await makeProject(app, {
        name: 'other-for-cross-post',
        authorId: otherAccount.id,
      })

      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${key.id}/values?project=${otherProject.id}`,
        payload: { lang: 'es', value: 'wrong project' },
      })

      expect(r.statusCode).toBe(404)
    })

    test('400 when project is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${key.id}/values`,
        payload: { lang: 'en', value: 'no-project' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when project is not a UUID', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${key.id}/values?project=not-a-uuid`,
        payload: { lang: 'en', value: 'whatever' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when keyId is not a UUID', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/not-a-uuid/values?project=${project.id}`,
        payload: { lang: 'en', value: 'whatever' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when body is empty', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${key.id}/values?project=${project.id}`,
        payload: {},
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when lang is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${key.id}/values?project=${project.id}`,
        payload: { value: 'no lang' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when value is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${key.id}/values?project=${project.id}`,
        payload: { lang: 'fr' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when lang is not a valid locale', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${key.id}/values?project=${project.id}`,
        payload: { lang: 'not_a_locale!', value: 'x' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when value is empty', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/tokens/keys/${key.id}/values?project=${project.id}`,
        payload: { lang: 'fr', value: '' },
      })

      expect(r.statusCode).toBe(400)
    })
  })
})
