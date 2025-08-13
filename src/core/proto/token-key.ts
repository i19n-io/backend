import { ApiProperty } from '@nestjs/swagger'

import { TOKEN_KEY_MAX_LENGTH } from '~/core/proto/constants'
import { ApiPropertyUuid } from '~/core/proto/helpers'

export class TokenKey {
  @ApiPropertyUuid()
  readonly id!: string

  @ApiPropertyUuid()
  readonly projectId!: string

  @ApiPropertyUuid()
  readonly parentId?: string

  /**
   * @see `TOKEN_KEY_MAX_LENGTH`
   */
  @ApiProperty({
    minLength: 1,
    maxLength: TOKEN_KEY_MAX_LENGTH,
    examples: ['login', 'buttonLabel', 'PageDocuments', 'title', 'common'],
  })
  readonly key!: string

  constructor({
    parentId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sort,
    ...data
  }: Omit<TokenKey, 'parentId'> & { parentId?: string | null; sort?: string }) {
    // Omit nulls
    if (parentId) this.parentId = parentId

    Object.assign(this, data)
  }
}
