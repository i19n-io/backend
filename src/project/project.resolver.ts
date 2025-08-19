import { equal } from 'node:assert/strict'

import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
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

  @Query(() => Project)
  async projectById(
    @Args('id', { type: () => UUIDResolver }, ParseUUIDPipe) id: string,
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
    @Args('id', { type: () => UUIDResolver }, ParseUUIDPipe) id: string,
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
