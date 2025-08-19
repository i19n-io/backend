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

  /** @todo Check and refactor field optionality */
  @Field(() => Account)
  readonly author?: Account

  @Field(() => Date)
  readonly created!: Date

  @Field(() => Date)
  readonly updated!: Date

  @Field(() => Date, { nullable: true })
  readonly deleted?: Date

  constructor({
    created,
    updated,
    deleted,
    ...rest
  }: Omit<Project, 'created' | 'updated' | 'deleted'> & {
    created: Date | string
    updated: Date | string
    deleted?: Date | string | null
  }) {
    this.created = toDate(created)
    this.updated = toDate(updated)
    if (deleted) this.deleted = toDate(deleted)

    Object.assign(this, rest)
  }
}
