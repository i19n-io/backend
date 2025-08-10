import { Controller, Get, HttpStatus } from '@nestjs/common'
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

const PONG = 'pong'

class PingResponse {
  @ApiProperty({ enum: [PONG] })
  ping = PONG
}

@ApiTags('Other')
@Controller('ping')
export class PingController {
  @Get()
  @ApiOperation({ summary: 'Ping the server' })
  @ApiResponse({ status: HttpStatus.OK, type: PingResponse })
  ping() {
    return new PingResponse()
  }
}
