import type { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DocumentBuilder,
  SwaggerModule,
  type SwaggerCustomOptions,
} from '@nestjs/swagger'

import { PaginationQuery } from '~/core/proto'

export const setupSwagger = (path: string, app: INestApplication) => {
  const configService = app.get<ConfigService>(ConfigService)

  const config = new DocumentBuilder()
    .setOpenAPIVersion('3.1.1')
    .setTitle('i19n — API')
    .setDescription('<a href="json">JSON</a> | <a href="yaml">YAML</a>')
    .setVersion(configService.get('version'))

    .addTag('Auth')

    .addTag('Other')
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [PaginationQuery],
  })

  const options: SwaggerCustomOptions = {
    swaggerOptions: {
      defaultModelsExpandDepth: 42,
      defaultModelExpandDepth: 42,
      defaultModelRendering: 'model',
    },
    customSiteTitle: config.info.title,
    jsonDocumentUrl: `${path}/json`,
    yamlDocumentUrl: `${path}/yaml`,
  }

  SwaggerModule.setup(`${path}/`, app, document, options)
}
