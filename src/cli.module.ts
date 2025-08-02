import { Module } from '@nestjs/common'

import { ConfigCommand } from '~/core/config.command'
import { configModule } from '~/core/config.module'

@Module({
  imports: [configModule],
  providers: [ConfigCommand],
})
export class CliModule {}
