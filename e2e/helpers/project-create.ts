import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import type { ProjectCreate } from '~/project/models'

import { gql } from '~/e2e/helpers/gql'

export const projectCreate = (
  app: NestFastifyApplication,
  dto: ProjectCreate,
) =>
  app.inject({
    method: 'POST',
    url: '/gql',
    body: gql(
      `
        mutation ProjectCreate ($dto: ProjectCreate!) {
          projectCreate(dto: $dto) {
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
        dto,
      },
    ),
  })
