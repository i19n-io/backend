import { equal } from 'node:assert/strict'

import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuthSignUp } from '~/core/proto'

import { SignService } from '~/auth/sign.service'

@Controller()
@ApiTags('Auth')
export class SignController {
  constructor(private readonly signService: SignService) {}

  /**
   * @todo Add `Location` header
   */
  @Post('sign-up')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account has been successfully created',
  })
  async signUp(@Body() dto: AuthSignUp) {
    const r = await this.signService.signUp(dto)
    if (r.ok) return

    // Just to make sure it won't work when more values are added
    // TODO: remove when more values are added
    equal(r.error, 'ALREADY_EXISTS', new InternalServerErrorException())

    // TODO: use switch/case when more values are added
    throw new ConflictException('User already exists')
  }
}
