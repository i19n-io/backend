import { Module } from '@nestjs/common'

import { ProjectController } from '~/project/project.controller'
import { ProjectService } from '~/project/project.service'

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
