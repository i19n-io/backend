import { Field, ObjectType } from '@nestjs/graphql'

import { EmailScalar, UrlScalar, UuidScalar } from '~/core/graphql/scalars'

import { toDate } from '~/helpers/to-date'

@ObjectType()
export class Account {
  @Field(() => UuidScalar)
  readonly id!: string

  @Field()
  readonly name!: string

  @Field(() => EmailScalar, { nullable: true })
  readonly email?: string

  @Field(() => UrlScalar, { nullable: true })
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
    created,
    updated,
    deleted,
    ...rest
  }: Omit<
    Account,
    | 'email'
    | 'avatar'
    | 'githubId'
    | 'githubUsername'
    | 'created'
    | 'updated'
    | 'deleted'
  > & {
    email?: string | null
    avatar?: string | null
    githubId?: string | null
    githubUsername?: string | null
    created: Date | string
    updated: Date | string
    deleted?: Date | string | null
  }) {
    if (email) this.email = email
    if (avatar) this.avatar = avatar
    if (githubId) this.githubId = githubId
    if (githubUsername) this.githubUsername = githubUsername
    this.created = toDate(created)
    this.updated = toDate(updated)
    if (deleted) this.deleted = toDate(deleted)

    Object.assign(this, rest)
  }
}
