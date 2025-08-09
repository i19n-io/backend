import { inspect } from 'node:util'

import { ConfigService } from '@nestjs/config'
import { Command, CommandRunner } from 'nest-commander'

import { config } from '~/core/config.module'

@Command({
  name: 'config',
  description: 'Debug configuration',
})
export class ConfigCommand extends CommandRunner {
  private readonly logger = {
    log: (data: unknown) => {
      // eslint-disable-next-line no-console
      console.log(inspect(data, { colors: true, depth: Infinity }))
    },
  }

  constructor(private readonly configService: ConfigService) {
    super()
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async run() {
    const data = config()
    const keys = Object.keys(data) as Array<keyof typeof data>
    const entries = keys.map(key => [key, this.configService.get(key)])

    this.logger.log(Object.fromEntries(entries))
  }
}
