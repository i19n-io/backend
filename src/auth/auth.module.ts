import { Module } from '@nestjs/common'

import { SignController } from '~/auth/sign.controller'
import { SignService } from '~/auth/sign.service'
import { UserModule } from '~/user/user.module'

@Module({
  imports: [UserModule],
  controllers: [SignController],
  providers: [SignService],
})
export class AuthModule {}
