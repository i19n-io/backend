import { Injectable } from '@nestjs/common'
import { sql } from 'drizzle-orm'

import {
  DatabaseService,
  tokenKeyTable,
  tokenValueTable,
} from '~/core/database'

import { ProjectService } from '~/project/project.service'

type TokenNode = {
  id: string
  parent_id: string | null
  key: string
  value: string | null
}

export type TokenStructuredNode = {
  id: string
  parentId?: string
  key: string
  value?: string
  children?: TokenStructuredNode[]
}

@Injectable()
export class TokenStructuredService {
  constructor(
    private readonly db: DatabaseService,
    private readonly projectService: ProjectService,
  ) {}

  /**
   * @todo Refactor
   */
  async getByProjectId(projectId: string, defaultLang: string) {
    const r = await this.db.execute<TokenNode>(sql`
      WITH RECURSIVE subtree AS (
        SELECT id, parent_id, key, sort
        FROM ${tokenKeyTable}
        WHERE project_id = ${projectId}
        UNION ALL
        SELECT tk.id, tk.parent_id, tk.key, tk.sort
        FROM ${tokenKeyTable} tk
        JOIN subtree s ON tk.parent_id = s.id
      )
      SELECT tk.id, tk.parent_id, tk.key, v.value
      FROM subtree tk
      LEFT JOIN ${tokenValueTable} v
        ON v.key_id = tk.id AND v.lang = ${defaultLang}
      ORDER BY tk.sort, tk.id
    `)

    return formatToStructured(r.rows)
  }

  /**
   * @todo Refactor
   */
  async getByProjectIdAndLang(
    projectId: string,
    requestedLang: string,
    defaultLang: string,
  ) {
    const r = await this.db.execute<TokenNode>(sql`
      WITH RECURSIVE subtree AS (
        SELECT id, parent_id, key, sort
        FROM ${tokenKeyTable}
        WHERE project_id = ${projectId}
        UNION ALL
        SELECT tk.id, tk.parent_id, tk.key, tk.sort
        FROM ${tokenKeyTable} tk
        JOIN subtree s ON tk.parent_id = s.id
      ),
      requested AS (
        SELECT tk.id, tk.parent_id, tk.key, tk.sort, v.value
        FROM subtree tk
        LEFT JOIN ${tokenValueTable} v
          ON v.key_id = tk.id AND v.lang = ${requestedLang}
      ),
      fallback AS (
        SELECT tk.id, tk.parent_id, tk.key, tk.sort, v.value
        FROM subtree tk
        LEFT JOIN ${tokenValueTable} v
          ON v.key_id = tk.id AND v.lang = ${defaultLang}
      )
      SELECT
        COALESCE(r.id, f.id) AS id,
        COALESCE(r.parent_id, f.parent_id) AS parent_id,
        COALESCE(r.key, f.key) AS key,
        COALESCE(r.value, f.value) AS value
      FROM fallback f
      LEFT JOIN requested r ON r.id = f.id
      ORDER BY f.sort, f.id
    `)

    return formatToStructured(r.rows)
  }

  /**
   * @todo Refactor
   */
  async getByTokenKeyId(tokenKeyId: string, defaultLang: string) {
    const r = await this.db.execute<TokenNode>(sql`
      WITH RECURSIVE subtree AS (
        SELECT id, parent_id, key, sort
        FROM ${tokenKeyTable}
        WHERE id = ${tokenKeyId}
        UNION ALL
        SELECT tk.id, tk.parent_id, tk.key, tk.sort
        FROM ${tokenKeyTable} tk
        JOIN subtree s ON tk.parent_id = s.id
      )
      SELECT tk.id, tk.parent_id, tk.key, v.value
      FROM subtree tk
      LEFT JOIN ${tokenValueTable} v
        ON v.key_id = tk.id AND v.lang = ${defaultLang}
      ORDER BY tk.sort, tk.id
    `)

    return formatToStructured(r.rows)
  }

  /**
   * @todo Refactor
   */
  async getByTokenKeyIdAndLang(
    tokenKeyId: string,
    requestedLang: string,
    defaultLang: string,
  ) {
    const r = await this.db.execute<TokenNode>(sql`
      WITH RECURSIVE subtree AS (
        SELECT id, parent_id, key, sort
        FROM ${tokenKeyTable}
        WHERE id = ${tokenKeyId}
        UNION ALL
        SELECT tk.id, tk.parent_id, tk.key, tk.sort
        FROM ${tokenKeyTable} tk
        JOIN subtree s ON tk.parent_id = s.id
      ),
      requested AS (
        SELECT tk.id, tk.parent_id, tk.key, tk.sort, v.value
        FROM subtree tk
        LEFT JOIN ${tokenValueTable} v
          ON v.key_id = tk.id AND v.lang = ${requestedLang}
      ),
      fallback AS (
        SELECT tk.id, tk.parent_id, tk.key, tk.sort, v.value
        FROM subtree tk
        LEFT JOIN ${tokenValueTable} v
          ON v.key_id = tk.id AND v.lang = ${defaultLang}
      )
      SELECT
        COALESCE(r.id, f.id) AS id,
        COALESCE(r.parent_id, f.parent_id) AS parent_id,
        COALESCE(r.key, f.key) AS key,
        COALESCE(r.value, f.value) AS value
      FROM fallback f
      LEFT JOIN requested r ON r.id = f.id
      ORDER BY f.sort, f.id
    `)

    return formatToStructured(r.rows)
  }
}

function formatToStructured(nodes: TokenNode[]): TokenStructuredNode[] {
  const map = new Map<string, TokenStructuredNode>()

  for (const node of nodes) {
    map.set(node.id, {
      id: node.id,
      parentId: node.parent_id ?? undefined,
      key: node.key,
      value: node.value ?? undefined,
    })
  }

  const roots: TokenStructuredNode[] = []

  for (const [_, node] of map) {
    const parent = node.parentId ? map.get(node.parentId) : undefined

    if (!parent) {
      roots.push(node)
      continue
    }

    if (parent.children) parent.children.push(node)
    else parent.children = [node]
  }

  return roots
}
