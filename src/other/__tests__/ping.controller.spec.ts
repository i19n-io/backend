import { Test, type TestingModule } from '@nestjs/testing'

import { PingController } from '~/other/ping.controller'

describe(PingController.name, () => {
  let controller: PingController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PingController],
    }).compile()

    controller = app.get(PingController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('GET', () => {
    it('should return correct value', () => {
      expect(controller.ping()).toMatchObject({ ping: 'pong' })
    })
  })
})
