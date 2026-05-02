import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'

import { ProjectService } from '~/project/project.service'
import { TokenKey, TokenKeyListQuery } from '~/token/models'
import { TokenKeyService } from '~/token/token-key.service'

@Controller()
@ApiTags('Token keys')
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
}
