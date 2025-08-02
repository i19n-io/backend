import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import type * as schema from '~/core/database/schema'

export class DatabaseService extends NodePgDatabase<typeof schema> {}
