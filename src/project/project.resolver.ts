import { equal } from 'node:assert/strict'

import { ParseUUIDPipe } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { UUIDResolver } from 'graphql-scalars'

import { Project, ProjectCreate, ProjectUpdate } from '~/project/models'
import { ProjectService } from '~/project/project.service'

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  projectList() {
    return this.projectService.findMany()
  }

  @Query(() => Project, { nullable: true })
  projectById(
    @Args('id', { type: () => UUIDResolver }, ParseUUIDPipe) id: string,
  ) {
    return this.projectService.findOne(id)
  }

  @Mutation(() => Project)
  async projectCreate(@Args('dto') dto: ProjectCreate) {
    const r = await this.projectService.create(dto)
    if (r.ok) return r.data

    // Just to make sure it won't work when more values are added
    // TODO: remove when more values are added
    equal(
      r.error,
      'ALREADY_EXISTS',
      // TODO: refactor, use universal error
      new GraphQLError('Internal Server Error', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      }),
    )

    // TODO: refactor, use universal error
    throw new GraphQLError('Project already exists', {
      extensions: {
        code: 'ALREADY_EXISTS',
      },
    })
  }

  @Mutation(() => Project)
  async projectUpdate(
    @Args('id', { type: () => UUIDResolver }, ParseUUIDPipe) id: string,
    @Args('dto') dto: ProjectUpdate,
  ) {
    const r = await this.projectService.update(id, dto)
    if (r.ok) return r.data

    // Just to make sure it won't work when more values are added
    // TODO: remove when more values are added
    equal(
      r.error,
      'NOT_FOUND',
      // TODO: refactor, use universal error
      new GraphQLError('Internal Server Error', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      }),
    )

    // TODO: refactor, use universal error
    throw new GraphQLError('Project not found', {
      extensions: {
        code: 'NOT_FOUND',
      },
    })
  }
}
