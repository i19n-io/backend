import { isUUID } from 'class-validator'
import { GraphQLScalarType, Kind } from 'graphql'

const validate = (v: unknown) => {
  if (isUUID(v)) return v
  // TODO: send log to monitoring system
  throw new Error('Invalid UUID scalar type')
}

export const UuidScalar = new GraphQLScalarType({
  name: 'UUID',
  description:
    'The `UUID` custom scalar type represents a valid UUID version 4.',
  specifiedByURL: 'https://tools.ietf.org/html/rfc4122',
  parseValue: validate,
  parseLiteral: ast => {
    if (ast.kind === Kind.STRING) return validate(ast.value)
    throw new Error('Invalid UUID scalar type')
  },
})
