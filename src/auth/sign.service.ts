import { Injectable } from '@nestjs/common'

import type { AuthSignUp } from '~/core/proto'

import { UserService } from '~/user/user.service'

@Injectable()
export class SignService {
  constructor(private readonly userService: UserService) {}

  signUp(dto: AuthSignUp) {
    return this.userService.create(dto)
  }
}
