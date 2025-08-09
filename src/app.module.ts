import { Module } from '@nestjs/common'

import { configModule } from '~/core/config.module'
import { databaseModule } from '~/core/database/database.module'

import { OtherModule } from '~/other/other.module'
import { UserModule } from '~/user/user.module'

@Module({
  imports: [configModule, databaseModule, OtherModule, UserModule],
})
export class AppModule {}
