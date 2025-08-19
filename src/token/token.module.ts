import { Module } from '@nestjs/common'

import { TokenKeyResolver } from '~/token/token-key.resolver'
import { TokenService } from '~/token/token.service'

@Module({
  providers: [TokenKeyResolver, TokenService],
})
export class TokenModule {}
