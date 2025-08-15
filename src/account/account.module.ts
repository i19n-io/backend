import { Module } from '@nestjs/common'

import { AccountService } from '~/account/account.service'

@Module({
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
