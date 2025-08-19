import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UUIDResolver } from 'graphql-scalars'

import { TokenKey, TokenKeyCreate } from '~/token/models'
import { TokenService } from '~/token/token.service'

@Resolver(() => TokenKey)
export class TokenKeyResolver {
  constructor(private readonly tokenService: TokenService) {}

  @Query(() => [TokenKey])
  async tokenKeyList(
    @Args('projectId', { type: () => UUIDResolver })
    projectId: string,

    @Args('parentId', {
      type: () => UUIDResolver,
      nullable: true,
      defaultValue: undefined,
    })
    parentId?: string | null,
  ) {
    return this.tokenService.findMany({
      projectId,
      parentId,
    })
  }

  @Query(() => TokenKey, { nullable: true })
  async tokenKeyById(
    @Args('projectId', { type: () => UUIDResolver }) projectId: string,
    @Args('id', { type: () => UUIDResolver }) id: string,
  ) {
    const r = await this.tokenService.findOne(projectId, id)
    if (r) return r

    throw new NotFoundException('Token key not found')
  }

  @Mutation(() => TokenKey)
  async tokenKeyCreate(
    @Args('projectId', { type: () => UUIDResolver }) projectId: string,
    @Args('dto') dto: TokenKeyCreate,
  ) {
    const r = await this.tokenService.create(projectId, dto)
    if (r.ok) return r.data

    throw new InternalServerErrorException('Failed to create token')
  }
}
