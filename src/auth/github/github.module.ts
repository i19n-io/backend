import { Module } from '@nestjs/common'

import { AccountModule } from '~/account/account.module'
import { GithubController } from '~/auth/github/github.controller'
import { GithubStrategy } from '~/auth/github/github.strategy'

@Module({
  imports: [AccountModule],
  controllers: [GithubController],
  providers: [GithubStrategy],
})
export class GithubModule {}
