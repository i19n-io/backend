import { ok } from 'node:assert'

import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { sql } from 'drizzle-orm'

import {
  DatabaseService,
  tokenKeyTable,
  tokenValueTable,
} from '~/core/database'

import { ValidateAsLang, ValidateAsUuid } from '~/helpers/validators'
import type { Project } from '~/project/models'
import { ProjectService } from '~/project/project.service'

type TokenNode = {
  id: string
  key: string
  parent_id: string | null
  value: string | null
}

class ParametersInput {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: '$property → Must be a string' })
  @IsNotEmpty({ message: '$property → Should not be empty' })
  readonly key?: string
}

class QueryParametersInput {
  @ApiProperty()
  @ValidateAsUuid()
  readonly project!: string

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

@Controller()
export class TokenController {
  constructor(
    private readonly db: DatabaseService,
    private readonly projectService: ProjectService,
  ) {}

  @Get('{:key}')
  async get(
    @Param() { key }: ParametersInput,
    @Query() { project: projectId, lang, format }: QueryParametersInput,
  ) {
    const project = await this.projectService.findOne(projectId)
    if (!project) throw new NotFoundException('Project not found')

    if (!key) {
      const nodes =
        lang && lang !== project.defaultLang
          ? await this.getByProjectAndLang(project, lang)
          : await this.getByProject(project)

      if (nodes.length === 0) return {}
      return this.getFormatted(nodes, format)
    }

    const keyParts = key.split('.')
    const lastKeyPart = keyParts.at(-1)
    ok(lastKeyPart, 'Key must not be empty')

    const r = await this.db.query.tokenKeyTable.findFirst({
      where: (t, { and, eq }) =>
        and(eq(t.projectId, project.id), eq(t.key, lastKeyPart)),
    })
    if (!r) return {}

    const nodes =
      lang && lang !== project.defaultLang
        ? await this.getByTokenKeyIdAndLang(r.id, lang, project.defaultLang)
        : await this.getByTokenKeyId(r.id, project.defaultLang)

    if (nodes.length === 0) return {}
    return this.getFormatted(nodes, format, keyParts)
  }

  /**
   * @todo Refactor
   */
  private getFormatted(
    nodes: TokenNode[],
    format: 'tree' | 'flat',
    keyParts?: string[],
  ) {
    if (format === 'tree') {
      let result: Record<string, unknown> = buildTree(nodes)

      if (keyParts?.length) {
        const reversedParts = keyParts
          .splice(0, keyParts.length - 1)
          .toReversed()
        for (const part of reversedParts) result = { [part]: result }
      }

      return result
    }

    return buildFlat(nodes, keyParts?.splice(0, keyParts.length - 1))
  }

  /**
   * @todo Refactor
   */
  private async getByProject(project: Project): Promise<TokenNode[]> {
    const r = await this.db.execute(sql`
      WITH RECURSIVE subtree AS (
        SELECT id, key, parent_id FROM ${tokenKeyTable}
        WHERE project_id = ${project.id}
        UNION ALL
        SELECT tk.id, tk.key, tk.parent_id
        FROM ${tokenKeyTable} tk
        JOIN subtree s ON tk.parent_id = s.id
      )
      SELECT
        tk.id,
        tk.key,
        tk.parent_id,
        v.value
      FROM subtree tk
      LEFT JOIN ${tokenValueTable} v
        ON v.key_id = tk.id AND v.lang = ${project.defaultLang}
    `)

    return r.rows as TokenNode[]
  }

  /**
   * @todo Refactor
   */
  private async getByProjectAndLang(project: Project, lang: string) {
    const r = await this.db.execute(sql`
      WITH RECURSIVE subtree AS (
        SELECT id, key, parent_id FROM ${tokenKeyTable}
        WHERE project_id = ${project.id}
        UNION ALL
        SELECT tk.id, tk.key, tk.parent_id
        FROM ${tokenKeyTable} tk
        JOIN subtree s ON tk.parent_id = s.id
      ),
      requested AS (
        SELECT
          tk.id,
          tk.key,
          tk.parent_id,
          v.value
        FROM subtree tk
        LEFT JOIN ${tokenValueTable} v
          ON v.key_id = tk.id AND v.lang = ${lang}
      ),
      fallback AS (
        SELECT
          tk.id,
          tk.key,
          tk.parent_id,
          v.value
        FROM subtree tk
        LEFT JOIN ${tokenValueTable} v
          ON v.key_id = tk.id AND v.lang = ${project.defaultLang}
      )
      SELECT
        COALESCE(r.id, f.id) AS id,
        COALESCE(r.key, f.key) AS key,
        COALESCE(r.parent_id, f.parent_id) AS parent_id,
        COALESCE(r.value, f.value) AS value
      FROM fallback f
      LEFT JOIN requested r ON r.id = f.id;
    `)

    return r.rows as TokenNode[]
  }

  /**
   * @todo Refactor
   */
  private async getByTokenKeyId(tokenKeyId: string, defaultLang: string) {
    const r = await this.db.execute(sql`
      WITH RECURSIVE subtree AS (
        SELECT id, key, parent_id FROM ${tokenKeyTable}
        WHERE id = ${tokenKeyId}
        UNION ALL
        SELECT tk.id, tk.key, tk.parent_id
        FROM ${tokenKeyTable} tk
        JOIN subtree s ON tk.parent_id = s.id
      )
      SELECT
        tk.id,
        tk.key,
        tk.parent_id,
        v.value
      FROM subtree tk
      LEFT JOIN ${tokenValueTable} v
        ON v.key_id = tk.id AND v.lang = ${defaultLang}
    `)

    return r.rows as TokenNode[]
  }

  /**
   * @todo Refactor
   */
  private async getByTokenKeyIdAndLang(
    tokenKeyId: string,
    requestedLang: string,
    defaultLang: string,
  ) {
    const r = await this.db.execute(sql`
      WITH RECURSIVE subtree AS (
        SELECT id, key, parent_id FROM ${tokenKeyTable}
        WHERE id = ${tokenKeyId}
        UNION ALL
        SELECT tk.id, tk.key, tk.parent_id
        FROM ${tokenKeyTable} tk
        JOIN subtree s ON tk.parent_id = s.id
      ),
      requested AS (
        SELECT
          tk.id,
          tk.key,
          tk.parent_id,
          v.value
        FROM subtree tk
        LEFT JOIN ${tokenValueTable} v
          ON v.key_id = tk.id AND v.lang = ${requestedLang}
      ),
      fallback AS (
        SELECT
          tk.id,
          tk.key,
          tk.parent_id,
          v.value
        FROM subtree tk
        LEFT JOIN ${tokenValueTable} v
          ON v.key_id = tk.id AND v.lang = ${defaultLang}
      )
      SELECT
        COALESCE(r.id, f.id) AS id,
        COALESCE(r.key, f.key) AS key,
        COALESCE(r.parent_id, f.parent_id) AS parent_id,
        COALESCE(r.value, f.value) AS value
      FROM fallback f
      LEFT JOIN requested r ON r.id = f.id;
    `)

    return r.rows as TokenNode[]
  }
}

function buildTree(nodes: TokenNode[]): Record<string, any> {
  const map = new Map<string, any>()

  for (const node of nodes) {
    map.set(node.id, node.value ?? {})
  }

  const root: Record<string, unknown> = {}

  for (const node of nodes) {
    if (node.parent_id) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parent = map.get(node.parent_id)
      if (typeof parent === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        parent[node.key] = map.get(node.id)
      } else {
        root[node.key] = map.get(node.id)
      }
    } else {
      root[node.key] = map.get(node.id)
    }
  }

  return root
}

function buildFlat(
  nodes: TokenNode[],
  prefix: string[] = [],
): Record<string, string> {
  const byId = new Map(nodes.map(n => [n.id, n]))

  const getFullKey = (node: TokenNode, prefix: string[] = []) => {
    const parts: string[] = []

    let current: TokenNode | undefined = node
    while (current) {
      parts.unshift(current.key)
      current = current.parent_id ? byId.get(current.parent_id) : undefined
    }

    parts.unshift(...prefix)

    return parts.join('.')
  }

  const result: Record<string, string> = {}
  for (const node of nodes) {
    if (node.value != undefined) {
      const fullKey = getFullKey(node, prefix)
      result[fullKey] = node.value
    }
  }

  return result
}
