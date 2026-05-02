import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'

import { TokenValue } from '~/token/models'
import { TokenValueService } from '~/token/token-value.service'

@Controller('token-values')
@ApiTags('Token values')
export class TokenValueController {
  constructor(private readonly tokenValueService: TokenValueService) {}

  @Get(':id')
  @ApiOkResponse({ type: TokenValue })
  @ApiNotFoundResponse({ description: 'Token value not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TokenValue> {
    const tokenValue = await this.tokenValueService.findOneById(id)
    if (!tokenValue) throw new NotFoundException('Token value not found')

    return tokenValue
  }
}
