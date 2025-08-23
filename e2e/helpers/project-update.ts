import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import type { Project, ProjectUpdate } from '~/project/models'

import { gql } from '~/e2e/helpers/gql'

export const projectUpdate = async (
  app: NestFastifyApplication,
  id: string,
  dto: ProjectUpdate,
) => {
  const r = await app.inject({
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

  const parsed: {
    data: {
      projectUpdate: Project
    }
  } = r.json()

  return {
    parsed,
    raw: r,
  }
}
