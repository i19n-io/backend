import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import type { ProjectUpdate } from '~/project/models'

import { gql } from '~/e2e/helpers/gql'

export const projectUpdate = (
  app: NestFastifyApplication,
  id: string,
  dto: ProjectUpdate,
) =>
  app.inject({
    method: 'POST',
    url: '/gql',
    body: gql(
      `
        mutation ProjectUpdate ($id: UUID!, $dto: ProjectUpdate!) {
          projectUpdate(id: $id, dto: $dto) {
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
      {
        id,
        dto,
      },
    ),
  })
