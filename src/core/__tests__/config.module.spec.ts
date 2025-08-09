import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'

import { configModule } from '~/core/config.module'

describe(ConfigModule.name, () => {
  let configService: ConfigService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [configModule],
    }).compile()

    configService = module.get(ConfigService)
  })

  it('should be defined', () => {
    expect(configService).toBeDefined()
  })

  it('NODE_ENV should be set to "test"', () => {
    expect(configService.get('node.env')).toBe('test')
  })
})
