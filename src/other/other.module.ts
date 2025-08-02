import { Module } from '@nestjs/common'

import { PingController } from '~/other/ping.controller'

@Module({
  controllers: [PingController],
})
export class OtherModule {}
