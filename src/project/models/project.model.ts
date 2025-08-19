import { Field, ObjectType } from '@nestjs/graphql'
import { UUIDResolver } from 'graphql-scalars'

import { Account } from '~/account/models'
import { toDate } from '~/helpers/to-date'

@ObjectType()
export class Project {
  @Field(() => UUIDResolver)
  readonly id!: string

  @Field()
  readonly name!: string

  @Field()
  readonly defaultLang!: string

  @Field(() => UUIDResolver)
  readonly authorId!: string

  @Field(() => Account)
  readonly author!: Account

  @Field(() => Date)
  readonly created!: Date

  @Field(() => Date)
  readonly updated!: Date

  @Field(() => Date, { nullable: true })
  readonly deleted?: Date

  constructor({
    deleted,
    ...rest
  }: Omit<Project, 'deleted'> & {
    deleted?: Date | null
  }) {
    if (deleted) this.deleted = toDate(deleted)

    Object.assign(this, rest)
  }
}
