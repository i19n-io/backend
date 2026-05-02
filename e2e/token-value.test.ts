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
  let tokenKey: TokenKey

  beforeAll(async () => {
    app = await createTestApp()

    const account = await makeAccount(app)
    project = await makeProject(app, {
      name: 'TokenValue REST test project',
      authorId: account.id,
    })
    tokenKey = await makeTokenKey(app, project.id, { key: 'greeting' })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /token-values/:id', () => {
    test('200 with body when found', async () => {
      const tokenValue = await makeTokenValue(app, tokenKey.id, {
        lang: 'en',
        value: 'Hello',
      })

      const r = await app.inject({
        method: 'GET',
        url: `/token-values/${tokenValue.id}`,
      })

      expect(r.statusCode).toBe(200)
      expect(r.json()).toEqual({
        id: tokenValue.id,
        keyId: tokenKey.id,
        lang: 'en',
        value: 'Hello',
      })
    })

    test('404 when not found', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/token-values/${randomUUID()}`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('400 when id is not a UUID', async () => {
      const r = await app.inject({
        method: 'GET',
        url: '/token-values/not-a-uuid',
      })

      expect(r.statusCode).toBe(400)
    })
  })

  describe('GET /token-keys/:keyId/values', () => {
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
        url: `/token-keys/${key.id}/values`,
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
        url: `/token-keys/${key.id}/values?langs=en,fr`,
      })

      expect(r.statusCode).toBe(200)
      const body = r.json<{ lang: string }[]>()
      expect(body).toHaveLength(2)
      expect(body.map(v => v.lang).sort()).toEqual(['en', 'fr'])
    })

    test('200 filtered by repeated langs param', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/token-keys/${key.id}/values?langs=en&langs=de`,
      })

      expect(r.statusCode).toBe(200)
      const body = r.json<{ lang: string }[]>()
      expect(body).toHaveLength(2)
      expect(body.map(v => v.lang).sort()).toEqual(['de', 'en'])
    })

    test('200 with single lang returns one-item array', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/token-keys/${key.id}/values?langs=fr`,
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
        url: `/token-keys/${empty.id}/values`,
      })

      expect(r.statusCode).toBe(200)
      expect(r.json()).toEqual([])
    })

    test('200 empty array when keyId does not exist', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/token-keys/${randomUUID()}/values`,
      })

      expect(r.statusCode).toBe(200)
      expect(r.json()).toEqual([])
    })

    test('400 when keyId is not a UUID', async () => {
      const r = await app.inject({
        method: 'GET',
        url: '/token-keys/not-a-uuid/values',
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when langs contains invalid locale', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/token-keys/${key.id}/values?langs=en,not_a_locale!`,
      })

      expect(r.statusCode).toBe(400)
    })
  })

  describe('GET /token-keys/:keyId/values/:lang', () => {
    let key: TokenKey

    beforeAll(async () => {
      key = await makeTokenKey(app, project.id, { key: 'salutation' })
      await makeTokenValue(app, key.id, { lang: 'en', value: 'english one' })
      await makeTokenValue(app, key.id, { lang: 'fr', value: 'french one' })
    })

    test('200 with the matching value', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/token-keys/${key.id}/values/en`,
      })

      expect(r.statusCode).toBe(200)
      expect(r.json()).toEqual({
        id: expect.any(String),
        keyId: key.id,
        lang: 'en',
        value: 'english one',
      })
    })

    test('404 when lang is not present for the key', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/token-keys/${key.id}/values/de`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('404 when keyId does not exist', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/token-keys/${randomUUID()}/values/en`,
      })

      expect(r.statusCode).toBe(404)
    })

    test('400 when keyId is not a UUID', async () => {
      const r = await app.inject({
        method: 'GET',
        url: '/token-keys/not-a-uuid/values/en',
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when lang is not a valid locale', async () => {
      const r = await app.inject({
        method: 'GET',
        url: `/token-keys/${key.id}/values/not_a_locale!`,
      })

      expect(r.statusCode).toBe(400)
    })
  })

  describe('POST /token-keys/:keyId/values', () => {
    let key: TokenKey

    beforeAll(async () => {
      key = await makeTokenKey(app, project.id, { key: 'creation' })
    })

    test('201 with created value', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/token-keys/${key.id}/values`,
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
        url: `/token-keys/${k.id}/values`,
        payload: { lang: 'en', value: 'second' },
      })

      expect(r.statusCode).toBe(409)
    })

    test('404 when keyId does not exist', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/token-keys/${randomUUID()}/values`,
        payload: { lang: 'en', value: 'orphan' },
      })

      expect(r.statusCode).toBe(404)
    })

    test('400 when keyId is not a UUID', async () => {
      const r = await app.inject({
        method: 'POST',
        url: '/token-keys/not-a-uuid/values',
        payload: { lang: 'en', value: 'whatever' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when body is empty', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/token-keys/${key.id}/values`,
        payload: {},
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when lang is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/token-keys/${key.id}/values`,
        payload: { value: 'no lang' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when value is missing', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/token-keys/${key.id}/values`,
        payload: { lang: 'fr' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when lang is not a valid locale', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/token-keys/${key.id}/values`,
        payload: { lang: 'not_a_locale!', value: 'x' },
      })

      expect(r.statusCode).toBe(400)
    })

    test('400 when value is empty', async () => {
      const r = await app.inject({
        method: 'POST',
        url: `/token-keys/${key.id}/values`,
        payload: { lang: 'fr', value: '' },
      })

      expect(r.statusCode).toBe(400)
    })
  })
})
