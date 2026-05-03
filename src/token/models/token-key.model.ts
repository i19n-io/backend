import { Field, ObjectType } from '@nestjs/graphql'
import { ApiProperty } from '@nestjs/swagger'
import { UUIDResolver } from 'graphql-scalars'

import { ApiPropertyUuid, ApiPropertyUuidOptional } from '~/core/proto/helpers'

@ObjectType()
export class TokenKey {
  @ApiPropertyUuid()
  @Field(() => UUIDResolver)
  readonly id!: string

  @ApiPropertyUuid()
  @Field(() => UUIDResolver)
  readonly projectId!: string

  @ApiPropertyUuidOptional()
  @Field(() => UUIDResolver, { nullable: true })
  readonly parentId?: string

  @ApiProperty()
  @Field()
  readonly key!: string

  constructor({
    parentId,
    sort: _,
    ...rest
  }: Omit<TokenKey, 'parentId' | 'sort'> & {
    parentId?: string | null
    sort?: string
  }) {
    if (parentId) this.parentId = parentId

    Object.assign(this, rest)
  }
}
