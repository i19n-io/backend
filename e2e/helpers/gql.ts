// TODO: refactor
export const gql = (q: string, variables?: Record<string, unknown>) => ({
  query: q,
  variables,
})
