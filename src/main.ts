import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from '~/app.module'
import { setupSwagger } from '~/helpers/setup/swagger'
import { setupValidation } from '~/helpers/setup/validation'

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService>(ConfigService)

  setupSwagger('swagger', app)
  setupValidation(app)

  await app.listen(configService.get('http.port'))
}

void bootstrap()
