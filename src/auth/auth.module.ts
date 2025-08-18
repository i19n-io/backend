import { Module } from '@nestjs/common'

import { GithubModule } from '~/auth/github/github.module'

@Module({
  imports: [GithubModule],
})
export class AuthModule {}
