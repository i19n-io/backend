import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'

import { ParseLocalePipe } from '~/helpers/pipes'
import { TokenValue, TokenValueListQuery } from '~/token/models'
import { TokenValueService } from '~/token/token-value.service'

@Controller()
@ApiTags('Token values')
export class TokenValueController {
  constructor(private readonly tokenValueService: TokenValueService) {}

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
}
