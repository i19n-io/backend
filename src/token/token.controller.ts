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

import { TokenKey, TokenKeyListQuery } from '~/core/proto'
import { TokenKeyCreate } from '~/core/proto/token-key-create'

import { TokenService } from '~/token/token.service'

@Controller()
@ApiTags('Tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiOperation({ summary: 'List all tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TokenKey,
    isArray: true,
    description: 'Paginated list of tokens',
  })
  list(@Query() dto: TokenKeyListQuery) {
    return this.tokenService.findMany(dto)
  }

  /**
   * @todo Add `Location` header
   */
  @Post()
  @ApiOperation({ summary: 'Create a new token' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Token has been successfully created',
  })
  async create(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Body() dto: TokenKeyCreate,
  ) {
    const r = await this.tokenService.create(projectId, dto)
    if (r.ok) return r.data

    throw new InternalServerErrorException('Failed to create token')
  }

  @Get(':token_id')
  @ApiResponse({ status: HttpStatus.OK, type: TokenKey })
  async get(
    @Param('project_id', ParseUUIDPipe) projectId: string,
    @Param('token_id', ParseUUIDPipe) tokenId: string,
  ) {
    const r = await this.tokenService.findOne(projectId, tokenId)
    if (r) return r

    throw new NotFoundException('Token not found')
  }
}
