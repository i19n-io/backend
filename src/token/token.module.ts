import { Module } from '@nestjs/common'

import { ProjectModule } from '~/project/project.module'
import { TokenKeyResolver } from '~/token/token-key.resolver'
import { TokenKeyService } from '~/token/token-key.service'
import { TokenStructuredService } from '~/token/token-structured.service'
import { TokenValueResolver } from '~/token/token-value.resolver'
import { TokenValueService } from '~/token/token-value.service'
import { TokenController } from '~/token/token.controller'

@Module({
  imports: [ProjectModule],
  controllers: [TokenController],
  providers: [
    // Services
    TokenKeyService,
    TokenValueService,
    TokenStructuredService,

    // Resolvers
    TokenKeyResolver,
    TokenValueResolver,
  ],
})
export class TokenModule {}
