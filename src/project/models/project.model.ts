import { Field, ObjectType } from '@nestjs/graphql'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UUIDResolver } from 'graphql-scalars'

import { ApiPropertyUuid } from '~/core/proto/helpers'

import { Account } from '~/account/models'
import { toDate } from '~/helpers/to-date'

@ObjectType()
export class Project {
  @ApiPropertyUuid()
  @Field(() => UUIDResolver)
  readonly id!: string

  @ApiProperty()
  @Field()
  readonly name!: string

  @ApiProperty()
  @Field()
  readonly defaultLang!: string

  @ApiPropertyUuid()
  @Field(() => UUIDResolver)
  readonly authorId!: string

  @ApiProperty({ type: () => Account })
  @Field(() => Account)
  readonly author!: Account

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
    deleted,
    ...rest
  }: Omit<Project, 'deleted'> & {
    deleted?: Date | null
  }) {
    if (deleted) this.deleted = toDate(deleted)

    Object.assign(this, rest)
  }
}
