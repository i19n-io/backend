import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UUIDResolver } from 'graphql-scalars'

import { TokenKey, TokenKeyCreate } from '~/token/models'
import { TokenKeyService } from '~/token/token-key.service'

@Resolver(() => TokenKey)
export class TokenKeyResolver {
  constructor(private readonly tokenKeyService: TokenKeyService) {}

  @Query(() => [TokenKey])
  tokenKeyList(
    @Args('projectId', { type: () => UUIDResolver })
    projectId: string,

    @Args('parentId', {
      type: () => UUIDResolver,
      nullable: true,
      defaultValue: undefined,
    })
    parentId?: string | null,
  ) {
    return this.tokenKeyService.findMany({
      projectId,
      parentId,
    })
  }

  @Query(() => TokenKey, { nullable: true })
  tokenKeyById(
    @Args('projectId', { type: () => UUIDResolver }) projectId: string,
    @Args('id', { type: () => UUIDResolver }) id: string,
  ) {
    return this.tokenKeyService.findOne(projectId, id)
  }

  @Mutation(() => TokenKey)
  async tokenKeyCreate(
    @Args('projectId', { type: () => UUIDResolver }) projectId: string,
    @Args('dto') dto: TokenKeyCreate,
  ) {
    const r = await this.tokenKeyService.create(projectId, dto)
    if (r.ok) return r.data
  }
}
