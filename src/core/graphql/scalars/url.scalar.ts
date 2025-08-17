import { isString, isURL } from 'class-validator'
import { GraphQLScalarType } from 'graphql'

const validate = (v: unknown) => {
  if (isString(v) && isURL(v)) return v
  // TODO: send log to monitoring system
  throw new Error('Invalid URL scalar type')
}

export const UrlScalar = new GraphQLScalarType({
  name: 'URL',
  description: 'The `URL` custom scalar type represents a valid URL address.',
  specifiedByURL: 'https://tools.ietf.org/html/rfc3986',
  parseValue: validate,
  parseLiteral: validate,
})
