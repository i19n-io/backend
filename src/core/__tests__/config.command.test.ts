import { Test } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfigCommand } from '~/core/config.command'
import { config } from '~/core/config.module'

import { CliModule } from '~/cli.module'

describe(ConfigCommand.name, () => {
  let configCommand: ConfigCommand

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CliModule],
    }).compile()

    configCommand = module.get(ConfigCommand)
    vi.spyOn(configCommand['logger'], 'log').mockImplementation(vi.fn())
  })

  it('should log current config', () => {
    void configCommand.run()
    expect(configCommand['logger'].log).toHaveBeenCalledWith(config())
  })
})
