import type { INestApplication } from '@nestjs/common'

import { AccountService } from '~/account/account.service'
import type { AccountCreate } from '~/account/models'
import type { ProjectCreate } from '~/project/models'
import { ProjectService } from '~/project/project.service'
import type { TokenKeyCreate, TokenValueCreate } from '~/token/models'
import { TokenKeyService } from '~/token/token-key.service'
import { TokenValueService } from '~/token/token-value.service'

const unwrap = <T>(
  r: { ok: true; data: T } | { ok: false; error?: string },
  label: string,
) => {
  if (!r.ok) throw new Error(`${label}: ${r.error ?? 'unknown'}`)
  return r.data
}

export const makeAccount = async (
  app: INestApplication,
  dto: Partial<AccountCreate> = {},
) => {
  const r = await app.get(AccountService).create({ name: 'John Doe', ...dto })
  return unwrap(r, 'Account create')
}

export const makeProject = async (
  app: INestApplication,
  dto: Partial<ProjectCreate> & { authorId: string },
) => {
  const r = await app.get(ProjectService).create({
    name: 'Test project',
    defaultLang: 'en',
    ...dto,
  })
  return unwrap(r, 'Project create')
}

export const makeTokenKey = async (
  app: INestApplication,
  projectId: string,
  dto: Partial<TokenKeyCreate> = {},
) => {
  const r = await app
    .get(TokenKeyService)
    .create(projectId, { key: 'k', position: 'end', ...dto })
  return unwrap(r, 'TokenKey create')
}

export const makeTokenValue = async (
  app: INestApplication,
  keyId: string,
  dto: TokenValueCreate,
) => {
  const r = await app.get(TokenValueService).create(keyId, dto)
  return unwrap(r, 'TokenValue create')
}
