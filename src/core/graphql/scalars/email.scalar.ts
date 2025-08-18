import { isEmail } from 'class-validator'
import { GraphQLScalarType, Kind } from 'graphql'

const validate = (v: unknown) => {
  if (isEmail(v)) return v
  // TODO: send log to monitoring system
  throw new Error('Invalid email scalar type')
}

export const EmailScalar = new GraphQLScalarType({
  name: 'Email',
  description:
    'The `Email` custom scalar type represents a valid email address.',
  specifiedByURL:
    'https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address',
  parseValue: validate,
  parseLiteral: ast => {
    if (ast.kind === Kind.STRING) return validate(ast.value)
    throw new Error('Invalid email scalar type')
  },
})
