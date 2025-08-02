import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from '~/app.module'
import { setupSwagger } from '~/helpers/setup/swagger'

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService>(ConfigService)

  setupSwagger('swagger', app)

  await app.listen(configService.get('http.port'))
}

void bootstrap()
