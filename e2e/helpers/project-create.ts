import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import type { Project, ProjectCreate } from '~/project/models'

import { gql } from '~/e2e/helpers/gql'

export const projectCreate = async (
  app: NestFastifyApplication,
  dto: ProjectCreate,
) => {
  const r = await app.inject({
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

  const parsed: {
    data: {
      projectCreate: Project
    }
  } = r.json()

  return {
    parsed,
    raw: r,
  }
}
