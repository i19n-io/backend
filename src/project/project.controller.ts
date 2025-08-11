import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { PaginationQuery, Project, ProjectCreate } from '~/core/proto'

import { ProjectService } from '~/project/project.service'

@Controller()
@ApiTags('Project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Project,
    isArray: true,
    description: 'Paginated list of projects',
  })
  list(@Query() dto: PaginationQuery) {
    return this.projectService.findMany(dto)
  }

  /**
   * @todo Add `Location` header
   */
  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project has been successfully created',
  })
  async create(@Body() dto: ProjectCreate) {
    const r = await this.projectService.create(dto)
    if (r.ok) return r.data

    throw new InternalServerErrorException('Failed to create project')
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, type: Project })
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const r = await this.projectService.findOne(id)
    if (r) return r

    throw new NotFoundException('Project not found')
  }
}
