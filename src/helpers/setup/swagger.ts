import type { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DocumentBuilder,
  SwaggerModule,
  type SwaggerCustomOptions,
} from '@nestjs/swagger'

export const setupSwagger = (path: string, app: INestApplication) => {
  const configService = app.get<ConfigService>(ConfigService)

  const config = new DocumentBuilder()
    .setOpenAPIVersion('3.1.1')
    .setTitle('i19n — API')
    .setDescription(
      [
        '<a href="json">JSON</a> • <a href="yaml">YAML</a>',
        '<br><br>',
        'Use `ESC` key to reset the UI state',
      ].join(''),
    )
    .setVersion(configService.get('version'))
    .addTag('Auth')
    .addTag('Projects')
    .addTag('Tokens')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  const options: SwaggerCustomOptions = {
    swaggerOptions: {
      defaultModelsExpandDepth: 42,
      defaultModelExpandDepth: 42,
      defaultModelRendering: 'model',
    },
    customJsStr: `
      // Escape key to reset the UI state
      document.addEventListener('keydown', e => {
        e = e || window.event
        if (!('key' in e)) return
        if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
          window.location.href = '#'
          window.location.reload()
        }
      })
    `,
    customSiteTitle: config.info.title,
    jsonDocumentUrl: `${path}/json`,
    yamlDocumentUrl: `${path}/yaml`,
  }

  SwaggerModule.setup(`${path}/`, app, document, options)
}
