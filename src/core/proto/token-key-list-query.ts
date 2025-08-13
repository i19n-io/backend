import { PaginationQuery } from '~/core/proto/extra'
import { ApiPropertyUuid } from '~/core/proto/helpers'

export class TokenKeyListQuery extends PaginationQuery {
  @ApiPropertyUuid()
  readonly projectId!: string

  @ApiPropertyUuid()
  readonly parentId?: string
}
