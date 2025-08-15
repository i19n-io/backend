import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github'

import { AccountService } from '~/account/account.service'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly accountService: AccountService,
    private readonly configService: ConfigService,
  ) {
    super(configService.get('oauth.github'))
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Strategy.Profile,
    callback: (error?: Error, user?: unknown) => void,
  ) {
    const { id: githubId } = profile
    const existing = await this.accountService.findOneByGithubId(githubId)

    if (existing) {
      callback(undefined, existing)
      return
    }

    const {
      displayName: name,
      username: githubUsername,
      emails,
      photos,
    } = profile

    const account = await this.accountService.create({
      name,
      email: emails?.at(0)?.value,
      avatar: photos?.at(0)?.value,
      githubId,
      githubUsername,
    })

    callback(undefined, account)
  }
}
