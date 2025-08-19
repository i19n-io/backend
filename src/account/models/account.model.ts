import { Field, ObjectType } from '@nestjs/graphql'
import {
  EmailAddressResolver,
  URLResolver,
  UUIDResolver,
} from 'graphql-scalars'

import { toDate } from '~/helpers/to-date'

@ObjectType()
export class Account {
  @Field(() => UUIDResolver)
  readonly id!: string

  @Field()
  readonly name!: string

  @Field(() => EmailAddressResolver, { nullable: true })
  readonly email?: string

  @Field(() => URLResolver, { nullable: true })
  readonly avatar?: string

  @Field({ nullable: true })
  readonly githubId?: string

  @Field({ nullable: true })
  readonly githubUsername?: string

  @Field(() => Date)
  readonly created!: Date

  @Field(() => Date)
  readonly updated!: Date

  @Field(() => Date, { nullable: true })
  readonly deleted?: Date

  constructor({
    email,
    avatar,
    githubId,
    githubUsername,
    deleted,
    ...rest
  }: Omit<
    Account,
    'email' | 'avatar' | 'githubId' | 'githubUsername' | 'deleted'
  > & {
    email?: string | null
    avatar?: string | null
    githubId?: string | null
    githubUsername?: string | null
    deleted?: Date | null
  }) {
    if (email) this.email = email
    if (avatar) this.avatar = avatar
    if (githubId) this.githubId = githubId
    if (githubUsername) this.githubUsername = githubUsername
    if (deleted) this.deleted = toDate(deleted)

    Object.assign(this, rest)
  }
}
