import { equal } from 'node:assert/strict'

import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { Pagination } from '~/core/graphql/extra'
import { UuidScalar } from '~/core/graphql/scalars'

import { Project, ProjectCreate, ProjectUpdate } from '~/project/models'
import { ProjectService } from '~/project/project.service'

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  async projectList(
    @Args('pagination', { defaultValue: new Pagination() })
    pagination: Pagination,
  ) {
    return await this.projectService.findMany(pagination)
  }

  @Query(() => Project)
  async projectById(
    // TODO: refactor UUID validation
    @Args('id', { type: () => UuidScalar }, ParseUUIDPipe) id: string,
  ) {
    const r = await this.projectService.findOne(id)
    if (r) return r

    throw new NotFoundException('Project not found')
  }

  @Mutation(() => Project)
  async projectCreate(@Args('dto') dto: ProjectCreate) {
    const r = await this.projectService.create(dto)
    if (r.ok) return r.data

    // Just to make sure it won't work when more values are added
    // TODO: remove when more values are added
    equal(r.error, 'ALREADY_EXISTS', new InternalServerErrorException())

    // TODO: use switch/case when more values are added
    throw new ConflictException('Project already exists')
  }

  @Mutation(() => Project)
  async projectUpdate(
    // TODO: refactor UUID validation
    @Args('id', { type: () => UuidScalar }, ParseUUIDPipe) id: string,
    @Args('dto') dto: ProjectUpdate,
  ) {
    const r = await this.projectService.update(id, dto)
    if (r.ok) return r.data

    // Just to make sure it won't work when more values are added
    // TODO: remove when more values are added
    equal(r.error, 'NOT_FOUND', new InternalServerErrorException())

    // TODO: use switch/case when more values are added
    throw new NotFoundException('Project not found')
  }
}
