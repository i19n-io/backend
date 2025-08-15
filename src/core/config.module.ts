import { readFileSync } from 'node:fs'

import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import type { Strategy } from 'passport-github'

const { env } = process

export const config = () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  version: String(JSON.parse(readFileSync('package.json', 'utf8')).version),

  node: {
    env: env.NODE_ENV,
  },

  http: {
    port: Number(env.HTTP_PORT),
  },

  db: {
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASS,
  },

  oauth: {
    github: {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      scope: ['read:user', 'user:email'],
    } satisfies Strategy._StrategyOptionsBase,
  },
})

export const configModule = ConfigModule.forRoot({
  load: [config],
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'test', 'production')
      .default('development'),

    HTTP_PORT: Joi.number().default('3000'),

    DB_HOST: Joi.string().empty('').default('localhost'),
    DB_PORT: Joi.number().empty('').default('5432'),
    DB_NAME: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().required(),

    GITHUB_CLIENT_ID: Joi.string().required(),
    GITHUB_CLIENT_SECRET: Joi.string().required(),
  }),
})
