import { Module } from '@nestjs/common'

import { GithubModule } from '~/auth/github/github.module'
import { SignController } from '~/auth/sign.controller'
import { SignService } from '~/auth/sign.service'
import { UserModule } from '~/user/user.module'

@Module({
  imports: [GithubModule, UserModule],
  controllers: [SignController],
  providers: [SignService],
})
export class AuthModule {}
