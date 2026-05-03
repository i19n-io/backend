import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'

import { ProjectService } from '~/project/project.service'
import { TokenKey, TokenKeyCreate, TokenKeyListQuery } from '~/token/models'
import { TokenKeyService } from '~/token/token-key.service'

@Controller()
@ApiTags('Tokens')
export class TokenKeyController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly tokenKeyService: TokenKeyService,
  ) {}

  @Get('projects/:projectId/token-keys')
  @ApiOkResponse({ type: TokenKey, isArray: true })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async findMany(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() { parentId }: TokenKeyListQuery,
  ): Promise<TokenKey[]> {
    const project = await this.projectService.findOne(projectId)
    if (!project) throw new NotFoundException('Project not found')

    return this.tokenKeyService.findMany({ projectId, parentId })
  }

  @Get('projects/:projectId/token-keys/:id')
  @ApiOkResponse({ type: TokenKey })
  @ApiNotFoundResponse({ description: 'Token key not found in project' })
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TokenKey> {
    const tokenKey = await this.tokenKeyService.findOne(projectId, id)
    if (!tokenKey) throw new NotFoundException('Token key not found in project')

    return tokenKey
  }

  @Post('projects/:projectId/token-keys')
  @ApiCreatedResponse({ type: TokenKey })
  @ApiNotFoundResponse({ description: 'Project or parent key not found' })
  @ApiConflictResponse({
    description: 'A key with this name already exists at this parent level',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, or `afterId` does not match a sibling',
  })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: TokenKeyCreate,
  ): Promise<TokenKey> {
    const project = await this.projectService.findOne(projectId)
    if (!project) throw new NotFoundException('Project not found')

    if (dto.parentId) {
      const parent = await this.tokenKeyService.findOne(projectId, dto.parentId)
      if (!parent) {
        throw new NotFoundException('Parent token key not found in project')
      }
    }

    const r = await this.tokenKeyService.create(projectId, dto)
    if (r.ok) return r.data

    switch (r.error) {
      case 'ALREADY_EXISTS': {
        throw new ConflictException(
          'Token key with this name already exists at this parent level',
        )
      }
      case 'AFTER_ID_NOT_FOUND': {
        throw new BadRequestException(
          '`afterId` is not a sibling under the requested parent',
        )
      }
    }
  }
}
