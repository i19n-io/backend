import { Module } from '@nestjs/common'

import { SignController } from '~/auth/sign.controller'
import { SignService } from '~/auth/sign.service'
import { UserService } from '~/user/user.service'

@Module({
  controllers: [SignController],
  providers: [SignService, UserService],
})
export class AuthModule {}
