import { Field, ObjectType } from '@nestjs/graphql'

import { UuidScalar } from '~/core/graphql/scalars'

@ObjectType()
export class TokenKey {
  @Field(() => UuidScalar)
  readonly id!: string

  @Field(() => UuidScalar)
  readonly projectId!: string

  @Field(() => UuidScalar, { nullable: true })
  readonly parentId?: string

  @Field()
  readonly key!: string

  constructor({
    parentId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sort,
    ...rest
  }: Omit<TokenKey, 'parentId' | 'sort'> & {
    parentId?: string | null
    sort?: string
  }) {
    if (parentId) this.parentId = parentId

    Object.assign(this, rest)
  }
}
