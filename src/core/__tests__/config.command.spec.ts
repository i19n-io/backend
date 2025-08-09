import { Test } from '@nestjs/testing'

import { ConfigCommand } from '~/core/config.command'
import { config, configModule } from '~/core/config.module'

describe(ConfigCommand.name, () => {
  let configCommand: ConfigCommand

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [configModule],
      providers: [ConfigCommand],
    }).compile()

    configCommand = module.get(ConfigCommand)
    jest.spyOn(configCommand['logger'], 'log').mockImplementation(jest.fn())
  })

  it('should log current config', () => {
    void configCommand.run()
    expect(configCommand['logger'].log).toHaveBeenCalledWith(config())
  })
})
