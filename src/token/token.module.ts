import { Module } from '@nestjs/common'

import { TokenController } from '~/token/token.controller'
import { TokenService } from '~/token/token.service'

@Module({
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
