import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'

import { configModule } from '~/core/config.module'
import { databaseModule } from '~/core/database/database.module'

import { AuthModule } from '~/auth/auth.module'
import { OtherModule } from '~/other/other.module'
import { UserModule } from '~/user/user.module'

@Module({
  imports: [
    configModule,
    databaseModule,

    AuthModule,
    OtherModule,
    UserModule,

    RouterModule.register([{ path: 'auth', module: AuthModule }]),
  ],
})
export class AppModule {}
