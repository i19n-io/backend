import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GithubGuard } from '~/auth/github/github.guard'

@Controller()
@UseGuards(GithubGuard)
@ApiTags('Auth')
export class GithubController {
  // TODO: add swagger description
  @Get()
  github() {}

  // TODO: add swagger description
  @Get('callback')
  githubCallback(@Req() request: { user: unknown }) {
    // TODO: refactor
    return request.user
  }
}
