import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'

import { configModule } from '~/core/config.module'
import { databaseModule } from '~/core/database/database.module'
import { graphqlModule } from '~/core/graphql/graphql.module'

import { AuthModule } from '~/auth/auth.module'
import { GithubModule } from '~/auth/github/github.module'
import { ProjectModule } from '~/project/project.module'
import { TokenModule } from '~/token/token.module'

@Module({
  imports: [
    configModule,
    databaseModule,
    graphqlModule,

    AuthModule,
    ProjectModule,
    TokenModule,

    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
        children: [{ path: 'github', module: GithubModule }],
      },
      {
        path: 'projects',
        module: ProjectModule,
        children: [{ path: ':project_id/tokens', module: TokenModule }],
      },
    ]),
  ],
})
export class AppModule {}
