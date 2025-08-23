import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { beforeAll, describe, expect, test } from 'vitest'

import { AccountService } from '~/account/account.service'
import type { Account } from '~/account/models'
import { AppModule } from '~/app.module'
import { setupFastifyAdapter } from '~/helpers/setup/fastify-adapter'
import type { Project } from '~/project/models'
import { ProjectService } from '~/project/project.service'
import type { TokenKey, TokenKeyCreate } from '~/token/models'

import { tokenKeyCreate } from '~/e2e/helpers'

describe('Token', () => {
  let app: NestFastifyApplication
  let account: Account
  let project: Project

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
    const rAccount = await accountService.create({ name: accountName })

    if (!rAccount.ok)
      throw new Error(`Account creation error: ${rAccount.error}`)
    account = rAccount.data

    const projectService = app.get(ProjectService)

    const rProject = await projectService.create({
      name: 'My project with tokens',
      defaultLang: 'en',
      authorId: account.id,
    })

    if (!rProject.ok)
      throw new Error(`Project creation error: ${rProject.error}`)
    project = rProject.data
  })

  describe('Create', () => {
    test('ok without parent', async ({ task }) => {
      const dto: TokenKeyCreate = {
        key: `testKey_${task.id}`,
        position: 'end',
      }

      const r = await tokenKeyCreate(app, project.id, dto)
      expect(r.raw.statusCode).toBe(200)

      expect(r.parsed).toEqual({
        data: {
          tokenKeyCreate: {
            id: expect.any(String),
            projectId: project.id,
            parentId: null,
            key: dto.key,
          },
        },
      })
    })

    test('ok with parent', async ({ task }) => {
      const dtoParent: TokenKeyCreate = {
        key: `testKey1_${task.id}`,
        position: 'end',
      }

      const rParent = await tokenKeyCreate(app, project.id, dtoParent)
      expect(rParent.raw.statusCode).toBe(200)

      const dto: TokenKeyCreate = {
        parentId: rParent.parsed.data.tokenKeyCreate.id,
        key: `testKey2_${task.id}`,
        position: 'end',
      }

      const r = await tokenKeyCreate(app, project.id, dto)
      expect(r.raw.statusCode).toBe(200)

      expect(r.parsed).toEqual({
        data: {
          tokenKeyCreate: {
            id: expect.any(String),
            projectId: project.id,
            parentId: dto.parentId,
            key: dto.key,
          },
        },
      })
    })
  })

  describe('Query', () => {
    test('ok list', async ({ task }) => {
      const dtoList: TokenKeyCreate[] = Array.from({ length: 3 }).map(
        (_, index) => ({
          key: `testKey_${index + 1}_${task.id}`,
          position: 'end',
        }),
      )

      const list: TokenKey[] = []

      for (const dto of dtoList) {
        const r = await tokenKeyCreate(app, project.id, dto)
        expect(r.raw.statusCode).toBe(200)
        list.push(r.parsed.data.tokenKeyCreate)
      }

      for (const [index, item] of list.entries()) {
        expect(item).toEqual({
          id: expect.any(String),
          projectId: project.id,
          parentId: null,
          key: dtoList.at(index)?.key,
        })
      }
    })

    test('ok by ID', async ({ task }) => {
      const dtoCreate: TokenKeyCreate = {
        key: `testKey_${task.id}`,
        position: 'end',
      }

      const rCreate = await tokenKeyCreate(app, project.id, dtoCreate)
      expect(rCreate.raw.statusCode).toBe(200)

      const r = await app.inject({
        method: 'POST',
        url: '/gql',
        body: {
          query: `
            query TokenKeyById ($projectId: UUID!, $id: UUID!) {
              tokenKeyById (projectId: $projectId, id: $id) {
                id
                projectId
                parentId
                key
              }
            }
          `,
          variables: {
            projectId: project.id,
            id: rCreate.parsed.data.tokenKeyCreate.id,
          },
        },
      })

      expect(r.statusCode).toBe(200)

      const json = r.json()

      expect(json).toEqual({
        data: {
          tokenKeyById: {
            id: rCreate.parsed.data.tokenKeyCreate.id,
            projectId: project.id,
            parentId: null,
            key: dtoCreate.key,
          },
        },
      })
    })
  })
})
