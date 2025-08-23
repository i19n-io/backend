import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UUIDResolver } from 'graphql-scalars'

import { TokenValue, TokenValueCreate } from '~/token/models'
import { TokenValueService } from '~/token/token-value.service'

@Resolver(() => TokenValue)
export class TokenValueResolver {
  constructor(private readonly tokenValueService: TokenValueService) {}

  @Query(() => [TokenValue])
  tokenValueList(
    @Args('keyId', { type: () => UUIDResolver }) keyId: string,
    @Args('langs', { type: () => [String], nullable: true }) langs?: string[],
  ) {
    return this.tokenValueService.findMany({ keyId, langs })
  }

  @Query(() => TokenValue, { nullable: true })
  tokenValueById(@Args('id', { type: () => UUIDResolver }) id: string) {
    return this.tokenValueService.findOneById(id)
  }

  @Query(() => TokenValue, { nullable: true })
  tokenValue(
    @Args('keyId', { type: () => UUIDResolver }) keyId: string,
    @Args('lang', { type: () => String }) lang: string,
  ) {
    return this.tokenValueService.findOne(keyId, lang)
  }

  @Mutation(() => TokenValue)
  async tokenValueCreate(
    @Args('keyId', { type: () => UUIDResolver }) keyId: string,
    @Args('dto') dto: TokenValueCreate,
  ) {
    const r = await this.tokenValueService.create(keyId, dto)
    if (r.ok) return r.data
  }
}
