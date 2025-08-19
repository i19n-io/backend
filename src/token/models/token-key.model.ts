import { Field, ObjectType } from '@nestjs/graphql'
import { UUIDResolver } from 'graphql-scalars'

@ObjectType()
export class TokenKey {
  @Field(() => UUIDResolver)
  readonly id!: string

  @Field(() => UUIDResolver)
  readonly projectId!: string

  @Field(() => UUIDResolver, { nullable: true })
  readonly parentId?: string

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
