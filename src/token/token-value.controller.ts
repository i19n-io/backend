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
  ApiTags,
} from '@nestjs/swagger'

import { ParseLocalePipe } from '~/helpers/pipes'
import {
  TokenValue,
  TokenValueCreate,
  TokenValueListQuery,
} from '~/token/models'
import { TokenKeyService } from '~/token/token-key.service'
import { TokenValueService } from '~/token/token-value.service'

@Controller()
@ApiTags('Token values')
export class TokenValueController {
  constructor(
    private readonly tokenKeyService: TokenKeyService,
    private readonly tokenValueService: TokenValueService,
  ) {}

  @Get('token-values/:id')
  @ApiOkResponse({ type: TokenValue })
  @ApiNotFoundResponse({ description: 'Token value not found' })
  async findOneById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TokenValue> {
    const tokenValue = await this.tokenValueService.findOneById(id)
    if (!tokenValue) throw new NotFoundException('Token value not found')

    return tokenValue
  }

  @Get('token-keys/:keyId/values')
  @ApiOkResponse({ type: TokenValue, isArray: true })
  async findMany(
    @Param('keyId', ParseUUIDPipe) keyId: string,
    @Query() { langs }: TokenValueListQuery,
  ): Promise<TokenValue[]> {
    return this.tokenValueService.findMany({ keyId, langs })
  }

  @Get('token-keys/:keyId/values/:lang')
  @ApiOkResponse({ type: TokenValue })
  @ApiNotFoundResponse({ description: 'Token value not found' })
  async findOne(
    @Param('keyId', ParseUUIDPipe) keyId: string,
    @Param('lang', ParseLocalePipe) lang: string,
  ): Promise<TokenValue> {
    const tokenValue = await this.tokenValueService.findOne(keyId, lang)
    if (!tokenValue) throw new NotFoundException('Token value not found')

    return tokenValue
  }

  @Post('token-keys/:keyId/values')
  @ApiCreatedResponse({ type: TokenValue })
  @ApiNotFoundResponse({ description: 'Token key not found' })
  @ApiConflictResponse({
    description: 'Token value for the given (keyId, lang) already exists',
  })
  async create(
    @Param('keyId', ParseUUIDPipe) keyId: string,
    @Body() dto: TokenValueCreate,
  ): Promise<TokenValue> {
    const key = await this.tokenKeyService.findOneById(keyId)
    if (!key) throw new NotFoundException('Token key not found')

    const r = await this.tokenValueService.create(keyId, dto)
    if (!r.ok) throw new ConflictException('Token value already exists')

    return r.data
  }
}
