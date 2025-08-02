import { Controller, Get } from '@nestjs/common'
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
  @ApiOperation({
    summary: 'Ping the server',
    description: 'Returns a simple response to check if the server is running.',
  })
  @ApiResponse({ status: 200, type: PingResponse })
  @Get()
  ping() {
    return new PingResponse()
  }
}
