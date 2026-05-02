import { randomUUID } from 'node:crypto'

import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { AccountService } from '~/account/account.service'
import { ProjectService } from '~/project/project.service'
import type { TokenKey, TokenValue } from '~/token/models'
import { TokenKeyService } from '~/token/token-key.service'
import { TokenValueService } from '~/token/token-value.service'

import { createTestApp } from '~/e2e/helpers'

describe('TokenValue (REST)', () => {
  let app: NestFastifyApplication
  let tokenKey: TokenKey
  let tokenValue: TokenValue

  beforeAll(async () => {
    app = await createTestApp()

    const rAccount = await app.get(AccountService).create({ name: 'John Doe' })
    if (!rAccount.ok) throw new Error(`Account: ${rAccount.error}`)

    const rProject = await app.get(ProjectService).create({
      name: 'TokenValue REST test project',
      defaultLang: 'en',
      authorId: rAccount.data.id,
    })
    if (!rProject.ok) throw new Error(`Project: ${rProject.error}`)

    const rTokenKey = await app
      .get(TokenKeyService)
      .create(rProject.data.id, { key: 'greeting', position: 'end' })
    if (!rTokenKey.ok) throw new Error('TokenKey create failed')
    tokenKey = rTokenKey.data

    const rTokenValue = await app
      .get(TokenValueService)
      .create(tokenKey.id, { lang: 'en', value: 'Hello' })
    if (!rTokenValue.ok) throw new Error(`TokenValue: ${rTokenValue.error}`)
    tokenValue = rTokenValue.data
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /token-values/:id', () => {
    test('200 with body when found', async () => {
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
})
