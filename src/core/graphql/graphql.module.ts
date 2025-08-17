import { join } from 'node:path'

import { HttpException, type HttpExceptionBody } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { MercuriusDriver, type MercuriusDriverConfig } from '@nestjs/mercurius'
import { defaultErrorFormatter } from 'mercurius'

import { EmailScalar, UrlScalar, UuidScalar } from '~/core/graphql/scalars'

import { AccountModule } from '~/account/account.module'
import { AccountService } from '~/account/account.service'
import type { Project } from '~/project/models'

type LoaderQuery<TParent> = { obj: TParent }

export const graphqlModule = GraphQLModule.forRootAsync<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  imports: [AccountModule],
  inject: [AccountService],
  useFactory: (accountService: AccountService) => ({
    autoSchemaFile: join(process.cwd(), 'src/core/graphql/schema.gql'),
    path: 'gql',
    graphiql: true,
    buildSchemaOptions: {
      numberScalarMode: 'integer',
      addNewlineAtEnd: true,
    },
    resolvers: {
      Email: EmailScalar,
      URL: UrlScalar,
      UUID: UuidScalar,
    },
    loaders: {
      Project: {
        // TODO: refactor, move away
        author: async (queries: LoaderQuery<Project>[]) => {
          const array = queries.map(q => q.obj.authorId)
          const uniqueSet = new Set(array)

          const rows = await accountService.findManyByIds([...uniqueSet])
          const byId = new Map(rows.map(r => [r.id, r]))

          return array.map(id => byId.get(id))
        },
      },
    },
    errorFormatter: (executionResult, context) => {
      const formatted = defaultErrorFormatter(executionResult, context)

      const orig = executionResult.errors.at(0)?.originalError

      if (orig instanceof HttpException) {
        const body = orig.getResponse() as HttpExceptionBody

        formatted.statusCode = body.statusCode

        formatted.response.errors = formatted.response.errors?.map(error => ({
          message:
            typeof body.message === 'string'
              ? body.message
              : (body.error ?? error.message),
          http: {
            code: body.statusCode,
            error: body.error,
            type: orig.name,
          },
          data: Array.isArray(body.message) ? body.message : undefined,
          locations: error.locations,
          path: error.path,
          extensions: error.extensions,
        }))
      }

      return formatted
    },
  }),
})
