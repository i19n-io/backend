import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import type { TokenKey, TokenKeyCreate } from '~/token/models'

import { gql } from '~/e2e/helpers/gql'

export const tokenKeyCreate = async (
  app: NestFastifyApplication,
  projectId: string,
  dto: TokenKeyCreate,
) => {
  const r = await app.inject({
    method: 'POST',
    url: '/gql',
    body: gql(
      `
        mutation TokenKeyCreate ($projectId: UUID!, $dto: TokenKeyCreate!) {
          tokenKeyCreate(projectId: $projectId, dto: $dto) {
            id
            projectId
            parentId
            key
          }
        }
      `,
      {
        projectId,
        dto,
      },
    ),
  })

  const parsed: {
    data: {
      tokenKeyCreate: TokenKey
    }
  } = r.json()

  return {
    parsed,
    raw: r,
  }
}
