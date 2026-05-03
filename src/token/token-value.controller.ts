import {
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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'

import {
  TokenValue,
  TokenValueCreate,
  TokenValueListQuery,
} from '~/token/models'
import { TokenKeyService } from '~/token/token-key.service'
import { TokenValueService } from '~/token/token-value.service'

@Controller('tokens')
@ApiTags('Tokens')
export class TokenValueController {
  constructor(
    private readonly tokenKeyService: TokenKeyService,
    private readonly tokenValueService: TokenValueService,
  ) {}

  @Get('keys/:keyId/values')
  @ApiOkResponse({ type: TokenValue, isArray: true })
  @ApiNotFoundResponse({ description: 'Token key not found in project' })
  async findMany(
    @Param('keyId', ParseUUIDPipe) keyId: string,
    @Query() { projectId, langs }: TokenValueListQuery,
  ): Promise<TokenValue[]> {
    const key = await this.tokenKeyService.findOne(projectId, keyId)
    if (!key) throw new NotFoundException('Token key not found in project')

    return this.tokenValueService.findMany({ keyId, langs })
  }

  @Post('keys/:keyId/values')
  @ApiQuery({
    name: 'projectId',
    required: true,
    type: String,
    format: 'uuid',
  })
  @ApiCreatedResponse({ type: TokenValue })
  @ApiNotFoundResponse({ description: 'Token key not found in project' })
  @ApiConflictResponse({
    description: 'Token value for the given (keyId, lang) already exists',
  })
  async create(
    @Param('keyId', ParseUUIDPipe) keyId: string,
    @Query('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: TokenValueCreate,
  ): Promise<TokenValue> {
    const key = await this.tokenKeyService.findOne(projectId, keyId)
    if (!key) throw new NotFoundException('Token key not found in project')

    const r = await this.tokenValueService.create(keyId, dto)
    if (!r.ok) throw new ConflictException('Token value already exists')

    return r.data
  }
}
