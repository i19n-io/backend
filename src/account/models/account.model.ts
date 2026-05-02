import { Field, ObjectType } from '@nestjs/graphql'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  EmailAddressResolver,
  URLResolver,
  UUIDResolver,
} from 'graphql-scalars'

import { ApiPropertyUuid } from '~/core/proto/helpers'

import { toDate } from '~/helpers/to-date'

@ObjectType()
export class Account {
  @ApiPropertyUuid()
  @Field(() => UUIDResolver)
  readonly id!: string

  @ApiProperty()
  @Field()
  readonly name!: string

  @ApiPropertyOptional({ format: 'email' })
  @Field(() => EmailAddressResolver, { nullable: true })
  readonly email?: string

  @ApiPropertyOptional({ format: 'url' })
  @Field(() => URLResolver, { nullable: true })
  readonly avatar?: string

  @ApiPropertyOptional()
  @Field({ nullable: true })
  readonly githubId?: string

  @ApiPropertyOptional()
  @Field({ nullable: true })
  readonly githubUsername?: string

  @ApiProperty({ type: Date })
  @Field(() => Date)
  readonly created!: Date

  @ApiProperty({ type: Date })
  @Field(() => Date)
  readonly updated!: Date

  @ApiPropertyOptional({ type: Date })
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
