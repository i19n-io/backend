import { Controller, Get, NotFoundException, Query } from '@nestjs/common'
import { ApiProperty, ApiTags } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { DatabaseService, type TokenKeySelect } from '~/core/database'
import { ApiPropertyUuid } from '~/core/proto/helpers'

import { ValidateAsLang } from '~/helpers/validators'
import { ProjectService } from '~/project/project.service'
import {
  TokenStructuredService,
  type TokenStructuredNode,
} from '~/token/token-structured.service'

class QueryParametersInput {
  @ApiPropertyUuid()
  readonly project!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: '$property → Must be a string' })
  @IsNotEmpty({ message: '$property → Should not be empty' })
  readonly key?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateAsLang()
  readonly lang?: string

  @ApiProperty({
    enum: ['tree', 'flat'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['tree', 'flat'], {
    message: '$property → Must be one of the following values: tree, flat',
  })
  readonly format: 'tree' | 'flat' = 'tree'
}

@Controller('tokens')
@ApiTags('Tokens')
export class TokenController {
  constructor(
    private readonly db: DatabaseService,
    private readonly projectService: ProjectService,
    private readonly tokenStructuredService: TokenStructuredService,
  ) {}

  @Get()
  async get(
    @Query() { project: projectId, key, lang, format }: QueryParametersInput,
  ) {
    const project = await this.projectService.findOne(projectId)
    if (!project) throw new NotFoundException('Project not found')

    if (!key) {
      const nodes =
        lang && lang !== project.defaultLang
          ? await this.tokenStructuredService.getByProjectIdAndLang(
              project.id,
              lang,
              project.defaultLang,
            )
          : await this.tokenStructuredService.getByProjectId(
              project.id,
              project.defaultLang,
            )

      if (nodes.length === 0) return {}
      return getFormatted(nodes, format)
    }

    const keyParts = key.split('.')
    const requestedItemsByKey: TokenKeySelect[] = []
    let lastRequestedItem: TokenKeySelect | undefined

    for (const [index, keyPart] of keyParts.entries()) {
      const previousItem = requestedItemsByKey.at(-1)

      const r = await this.db.query.tokenKeyTable.findFirst({
        where: (t, { and, eq, isNull }) =>
          and(
            eq(t.projectId, project.id),
            previousItem ? eq(t.parentId, previousItem.id) : isNull(t.parentId),
            eq(t.key, keyPart),
          ),
      })

      if (!r) return {}

      if (index === keyParts.length - 1) {
        lastRequestedItem = r
        break
      }

      requestedItemsByKey.push(r)
    }

    if (!lastRequestedItem) {
      // TODO: send log to monitoring system
      throw new Error('`lastRequestedItemId` should be defined')
    }

    let result =
      lang && lang !== project.defaultLang
        ? await this.tokenStructuredService.getByTokenKeyIdAndLang(
            lastRequestedItem.id,
            lang,
            project.defaultLang,
          )
        : await this.tokenStructuredService.getByTokenKeyId(
            lastRequestedItem.id,
            project.defaultLang,
          )

    for (const item of requestedItemsByKey.toReversed()) {
      result = [
        {
          id: item.id,
          parentId: item.parentId ?? undefined,
          key: item.key,
          children: result,
        },
      ]
    }

    return getFormatted(result, format)
  }
}

function getFormatted(nodes: TokenStructuredNode[], format: 'tree' | 'flat') {
  switch (format) {
    case 'tree':
      return buildTree(nodes)
    case 'flat':
      return buildFlat(nodes)
  }
}

function buildTree(nodes: TokenStructuredNode[]): Record<string, any> {
  return Object.fromEntries(
    nodes.map(node => [
      node.key,
      node.value ?? (node.children ? buildTree(node.children) : ''),
    ]),
  )
}

function buildFlat(nodes: TokenStructuredNode[]): Record<string, string> {
  const result: Record<string, string> = {}

  const recurse = (node: TokenStructuredNode, parentKey: string) => {
    const fullKey = parentKey ? `${parentKey}.${node.key}` : node.key

    if (node.children?.length) {
      for (const child of node.children) recurse(child, fullKey)
      return
    }

    result[fullKey] = node.value ?? ''
  }

  for (const node of nodes) recurse(node, '')

  return result
}
