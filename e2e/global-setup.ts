import { execSync } from 'node:child_process'

import { PostgreSqlContainer } from '@testcontainers/postgresql'

export const setup = async () => {
  const postgres = await new PostgreSqlContainer('postgres:17-alpine').start()

  process.env.DB_HOST = postgres.getHost()
  process.env.DB_PORT = postgres.getFirstMappedPort().toString()
  process.env.DB_NAME = postgres.getDatabase()
  process.env.DB_USER = postgres.getUsername()
  process.env.DB_PASS = postgres.getPassword()

  execSync('npm run db:push')

  return async () => {
    await postgres.stop()
  }
}
