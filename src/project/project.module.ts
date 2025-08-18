import { Module } from '@nestjs/common'

import { ProjectResolver } from '~/project/project.resolver'
import { ProjectService } from '~/project/project.service'

@Module({
  providers: [ProjectResolver, ProjectService],
})
export class ProjectModule {}
