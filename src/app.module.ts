import { Module } from '@nestjs/common'

import { configModule } from '~/core/config.module'
import { databaseModule } from '~/core/database/database.module'
import { OtherModule } from '~/other/other.module'

@Module({
  imports: [configModule, databaseModule, OtherModule],
})
export class AppModule {}
