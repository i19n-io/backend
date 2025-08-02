import { Module } from '@nestjs/common'

import { configModule } from '~/core/config.module'
import { OtherModule } from '~/other/other.module'

@Module({
  imports: [configModule, OtherModule],
})
export class AppModule {}
