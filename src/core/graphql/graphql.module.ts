import { join } from 'node:path'

import { GraphQLModule } from '@nestjs/graphql'
import { MercuriusDriver, type MercuriusDriverConfig } from '@nestjs/mercurius'

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
    loaders: {
      Project: {
        // TODO: refactor, move away
        // TODO: optimize when requested only `id` (`authorId` → `author.id`)
        author: async (queries: LoaderQuery<Project>[]) => {
          const array = queries.map(q => q.obj.authorId)
          const uniqueSet = new Set(array)

          const rows = await accountService.findManyByIds([...uniqueSet])
          const byId = new Map(rows.map(r => [r.id, r]))

          return array.map(id => byId.get(id))
        },
      },
    },
  }),
})
