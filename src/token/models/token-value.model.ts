import { Field, ObjectType } from '@nestjs/graphql'
import { UUIDResolver } from 'graphql-scalars'

@ObjectType()
export class TokenValue {
  @Field(() => UUIDResolver)
  readonly id!: string

  @Field(() => UUIDResolver)
  readonly keyId!: string

  @Field()
  readonly lang!: string

  @Field()
  readonly value!: string

  constructor(data: TokenValue) {
    Object.assign(this, data)
  }
}
