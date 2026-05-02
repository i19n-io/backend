import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'

import { AppModule } from '~/app.module'
import { setupFastifyAdapter } from '~/helpers/setup/fastify-adapter'
import { setupValidation } from '~/helpers/setup/validation'

export const createTestApp = async () => {
  const moduleReference = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleReference.createNestApplication<NestFastifyApplication>(
    setupFastifyAdapter(),
  )

  setupValidation(app)

  await app.init()
  await app.getHttpAdapter().getInstance().ready()

  return app
}
