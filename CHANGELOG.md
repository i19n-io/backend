# Changelog

The format is based on [Keep a Changelog].

## [Unreleased]

### Added

- `CHANGELOG.md` file ([3])
- Swagger UI for API documentation ([1])
- PostgreSQL database integration via Drizzle ORM ([2])
- Set up `AuthModule` and primitive authentication functionality ([25])
- Set up `ProjectModule` with basic create/read functionality ([29])
- Extra API model `PaginationQuery` ([29])
- Set up `TokenModule` with basic create/read functionality ([34])
- Set up `AccountModule` and `AccountService` with basic functionality ([49])
- GitHub OAuth2 integration ([44])
- GraphQL API integration ([54])

### Changed

- Updates in `CHANGELOG.md` now contain links to issues rather than PRs ([25])

### Deprecated

### Removed

### Fixed

### Security

### Internal

- Added `@nestjs/swagger` package ([1])
- Added `drizzle-orm`, `pg`, `@types/pg`, `drizzle-kit` packages ([2])
- Added `eslint-plugin-jest`, `eslint-plugin-unicorn` packages ([23])
- Added `class-transformer`, `class-validator` packages ([23])
- Added `@nestjs/passport`, `passport` packages ([44])
- Added `passport-github`, `@types/passport-github` packages ([44])
- Added `@fastify/static`, `@nestjs/platform-fastify` packages ([52])
- Migrated to Fastify as the HTTP provider ([52])
- Removed `@nestjs/platform-express`, `@types/express` ([54])
- Added `@nestjs/graphql`, `graphql` packages ([54])
- Added `@nestjs/mercurius`, `mercurius` packages ([54])
- Added `jiti` package for using TypeScript in ESLint config file ([54])
- Migrated `eslint.config.mjs` → `eslint.config.ts` ([54])
- Migrated `.cspell.json` → `cspell.config.json` ([54])

<!-- Links -->

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0

<!-- Links to issues -->

[54]: https://github.com/i19n-io/backend/issues/54
[52]: https://github.com/i19n-io/backend/issues/52
[49]: https://github.com/i19n-io/backend/issues/49
[44]: https://github.com/i19n-io/backend/issues/44
[34]: https://github.com/i19n-io/backend/issues/34
[29]: https://github.com/i19n-io/backend/issues/29
[25]: https://github.com/i19n-io/backend/issues/25
[23]: https://github.com/i19n-io/backend/issues/23
[3]: https://github.com/i19n-io/backend/issues/3
[2]: https://github.com/i19n-io/backend/issues/2
[1]: https://github.com/i19n-io/backend/issues/1

<!-- Links to versions -->

[unreleased]: https://github.com/i19n-io/backend/compare/v0.0.0...HEAD
