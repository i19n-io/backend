import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { beforeAll, describe, expect, test } from 'vitest'

import { AccountService } from '~/account/account.service'
import type { Account } from '~/account/models'
import { AppModule } from '~/app.module'
import { setupFastifyAdapter } from '~/helpers/setup/fastify-adapter'
import type { ProjectCreate, ProjectUpdate } from '~/project/models'

import { projectCreate, projectUpdate } from '~/e2e/helpers'

describe('Project', () => {
  let app: NestFastifyApplication
  let account: Account

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleReference.createNestApplication<NestFastifyApplication>(
      setupFastifyAdapter(),
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    const accountService = app.get(AccountService)

    const accountName = 'John Doe'
    const r = await accountService.create({ name: accountName })

    if (!r.ok) throw new Error(`Account creation error: ${r.error}`)
    account = r.data
  })

  describe('Create', () => {
    test('ok with valid data', async () => {
      const dto: ProjectCreate = {
        name: 'My first project in E2E tests',
        defaultLang: 'en',
        authorId: account.id,
      }

      const r = await projectCreate(app, dto)
      const json = r.json()

      expect(json).toEqual({
        data: {
          projectCreate: {
            id: expect.any(String),
            name: dto.name,
            defaultLang: dto.defaultLang,
            author: {
              id: account.id,
              name: account.name,
            },
            created: expect.any(String),
            updated: expect.any(String),
            deleted: null,
          },
        },
      })

      const { created, updated } = json.data.projectCreate
      expect(updated).toBe(created)
    })
  })

  describe('Update', () => {
    test('ok with valid data', async () => {
      const dtoCreate: ProjectCreate = {
        name: 'My original project',
        defaultLang: 'en',
        authorId: account.id,
      }

      const rCreate = await projectCreate(app, dtoCreate)
      const jsonCreate = rCreate.json()

      const createdId = jsonCreate.data.projectCreate.id as string

      const dtoUpdate: ProjectUpdate = {
        name: 'My updated project',
        defaultLang: 'en-GB',
        // TODO: authorId
      }

      const r = await projectUpdate(app, createdId, dtoUpdate)
      const json = r.json()

      expect(json).toEqual({
        data: {
          projectUpdate: {
            id: createdId,
            name: dtoUpdate.name,
            defaultLang: dtoUpdate.defaultLang,
            author: {
              id: account.id,
              name: account.name,
            },
            created: expect.any(String),
            updated: expect.any(String),
            deleted: null,
          },
        },
      })

      const { created, updated } = json.data.projectUpdate
      expect(updated).not.toBe(created)
    })
  })
})
