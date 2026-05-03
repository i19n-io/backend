import { Field, ObjectType } from '@nestjs/graphql'
import { ApiProperty } from '@nestjs/swagger'
import { UUIDResolver } from 'graphql-scalars'

import { ApiPropertyUuid } from '~/core/proto/helpers'

@ObjectType()
export class TokenValue {
  @ApiPropertyUuid()
  @Field(() => UUIDResolver)
  readonly id!: string

  @ApiPropertyUuid()
  @Field(() => UUIDResolver)
  readonly keyId!: string

  @ApiProperty()
  @Field()
  readonly lang!: string

  @ApiProperty()
  @Field()
  readonly value!: string

  constructor(data: TokenValue) {
    Object.assign(this, data)
  }
}
