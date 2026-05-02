import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'

import { Project } from '~/project/models'
import { ProjectService } from '~/project/project.service'

@Controller('projects')
@ApiTags('Projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOkResponse({ type: Project, isArray: true })
  async findMany(): Promise<Project[]> {
    return this.projectService.findMany()
  }
}
