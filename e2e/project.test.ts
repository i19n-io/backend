import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { beforeAll, describe, expect, test } from 'vitest'

import { AccountService } from '~/account/account.service'
import type { Account } from '~/account/models'
import { AppModule } from '~/app.module'
import { setupFastifyAdapter } from '~/helpers/setup/fastify-adapter'
import type { Project, ProjectCreate, ProjectUpdate } from '~/project/models'

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
      expect(r.raw.statusCode).toBe(200)

      expect(r.parsed).toEqual({
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

      const { created, updated } = r.parsed.data.projectCreate
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
      expect(rCreate.raw.statusCode).toBe(200)

      const dtoUpdate: ProjectUpdate = {
        name: 'My updated project',
        defaultLang: 'en-GB',
        // TODO: authorId
      }

      const createdId = rCreate.parsed.data.projectCreate.id
      const r = await projectUpdate(app, createdId, dtoUpdate)
      expect(r.raw.statusCode).toBe(200)

      expect(r.parsed).toEqual({
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

      const { created, updated } = r.parsed.data.projectUpdate
      expect(updated).not.toBe(created)
    })
  })

  describe('Query', () => {
    test('ok list', async () => {
      const dtoList: ProjectCreate[] = Array.from({ length: 3 }).map(
        (_, index) => ({
          name: `My project ${index + 1}`,
          defaultLang: index % 2 === 0 ? 'en' : 'en-GB',
          authorId: account.id,
        }),
      )

      const list: Project[] = []

      for (const dto of dtoList) {
        const r = await projectCreate(app, dto)
        expect(r.raw.statusCode).toBe(200)
        list.push(r.parsed.data.projectCreate)
      }

      for (const [index, json] of list.entries()) {
        expect(json).toEqual({
          id: expect.any(String),
          name: dtoList.at(index)?.name,
          defaultLang: dtoList.at(index)?.defaultLang,
          author: {
            id: account.id,
            name: account.name,
          },
          created: expect.any(String),
          updated: expect.any(String),
          deleted: null,
        })
      }
    })

    test('ok by ID', async () => {
      const dtoCreate: ProjectCreate = {
        name: 'My original project',
        defaultLang: 'en',
        authorId: account.id,
      }

      const rCreate = await projectCreate(app, dtoCreate)
      expect(rCreate.raw.statusCode).toBe(200)

      const createdId = rCreate.parsed.data.projectCreate.id

      const r = await app.inject({
        method: 'POST',
        url: '/gql',
        body: {
          query: `
            query ProjectById ($id: UUID!) {
              projectById (id: $id) {
                id
                name
                defaultLang
                author {
                  id
                  name
                }
                created
                updated
                deleted
              }
            }
          `,
          variables: { id: createdId },
        },
      })

      expect(r.statusCode).toBe(200)

      const json = r.json()

      expect(json).toEqual({
        data: {
          projectById: {
            id: createdId,
            name: dtoCreate.name,
            defaultLang: dtoCreate.defaultLang,
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
    })
  })
})
