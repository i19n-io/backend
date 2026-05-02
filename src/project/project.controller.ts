import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'

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

  @Get(':id')
  @ApiOkResponse({ type: Project })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Project> {
    const project = await this.projectService.findOne(id)
    if (!project) throw new NotFoundException('Project not found')

    return project
  }
}
