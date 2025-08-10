import { ApiProperty } from '@nestjs/swagger'

import { PROJECT_NAME_MAX_LENGTH } from '~/core/proto'
import { ApiPropertyLang, ApiPropertyUuid } from '~/core/proto/helpers'

const getDate = (v: Date | string) => (typeof v === 'string' ? new Date(v) : v)

export class Project {
  @ApiPropertyUuid()
  readonly id!: string

  /**
   * @see `PROJECT_NAME_MAX_LENGTH`
   */
  @ApiProperty({
    minLength: 1,
    maxLength: PROJECT_NAME_MAX_LENGTH,
  })
  readonly name!: string

  @ApiPropertyLang()
  readonly defaultLang!: string

  @ApiPropertyUuid()
  readonly authorId!: string

  @ApiProperty({ type: Date })
  readonly created!: Date

  @ApiProperty({ type: Date })
  readonly updated!: Date

  @ApiProperty({ type: Date, required: false })
  readonly deleted?: Date

  constructor({
    authorId,
    created,
    updated,
    deleted,
    ...d
  }: Omit<Project, 'authorId' | 'created' | 'updated' | 'deleted'> & {
    authorId: string | null
    created: Date | string
    updated: Date | string
    deleted?: Date | string | null
  }) {
    // Omit null
    if (authorId) this.authorId = authorId
    this.created = getDate(created)
    this.updated = getDate(updated)
    // Omit null
    if (deleted) this.deleted = getDate(deleted)

    Object.assign(this, d)
  }
}
