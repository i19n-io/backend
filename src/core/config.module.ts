import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

const { env } = process

export const config = () => ({
  node: {
    env: env.NODE_ENV,
  },

  http: {
    port: Number(env.HTTP_PORT),
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
  }),
})
