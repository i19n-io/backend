import { InputType, PartialType } from '@nestjs/graphql'

import { ProjectCreate } from '~/project/models/project-create.input'

@InputType()
export class ProjectUpdate extends PartialType(ProjectCreate, {
  decorator: InputType,
  omitDefaultValues: true,
  skipNullProperties: false,
}) {}
