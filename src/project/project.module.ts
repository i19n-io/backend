import { Module } from '@nestjs/common'

import { AccountModule } from '~/account/account.module'
import { ProjectController } from '~/project/project.controller'
import { ProjectResolver } from '~/project/project.resolver'
import { ProjectService } from '~/project/project.service'

@Module({
  imports: [AccountModule],
  controllers: [ProjectController],
  providers: [ProjectResolver, ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
