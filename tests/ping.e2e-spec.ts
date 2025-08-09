import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'
import type { App } from 'supertest/types'

import { AppModule } from '~/app.module'

describe('PingController (e2e)', () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  it('/ping (GET)', () => {
    request(app.getHttpServer())
      .get('/ping')
      .end((_, response) => {
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({ ping: 'pong' })
      })
  })
})
