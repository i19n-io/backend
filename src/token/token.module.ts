import { Module } from '@nestjs/common'

import { TokenKeyResolver } from '~/token/token-key.resolver'
import { TokenKeyService } from '~/token/token-key.service'

@Module({
  providers: [TokenKeyResolver, TokenKeyService],
})
export class TokenModule {}
