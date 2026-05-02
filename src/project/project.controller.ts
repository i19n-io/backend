import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'

import { AccountService } from '~/account/account.service'
import { Project, ProjectCreate } from '~/project/models'
import { ProjectService } from '~/project/project.service'

@Controller('projects')
@ApiTags('Projects')
export class ProjectController {
  constructor(
    private readonly accountService: AccountService,
    private readonly projectService: ProjectService,
  ) {}

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

  @Post()
  @ApiCreatedResponse({ type: Project })
  @ApiNotFoundResponse({ description: 'Author not found' })
  @ApiConflictResponse({ description: 'Project already exists' })
  async create(@Body() dto: ProjectCreate): Promise<Project> {
    const author = await this.accountService.findOneById(dto.authorId)
    if (!author) throw new NotFoundException('Author not found')

    const r = await this.projectService.create(dto)
    if (!r.ok) throw new ConflictException('Project already exists')

    return r.data
  }
}
