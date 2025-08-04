# Changelog

The format is based on [Keep a Changelog].

## [Unreleased]

### Added

- Swagger UI for API documentation ([1])
- PostgreSQL database integration via Drizzle ORM ([2])
- `CHANGELOG.md` file ([3])

### Changed

### Deprecated

### Removed

### Fixed

### Security

### Internal

- Added `@nestjs/swagger` package ([1])
- Added `drizzle-orm`, `pg`, `@types/pg`, `drizzle-kit` packages ([2])
- Migrated to singular table names in database schema ([16], [15])

<!-- Links -->

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0

<!-- Links to pull requests -->

[16]: https://github.com/i19n-io/backend/issues/16 'Create schemas for language module'
[15]: https://github.com/i19n-io/backend/issues/15 'Create language module'
[3]: https://github.com/i19n-io/backend/issues/3 'Add CHANGELOG.md'
[2]: https://github.com/i19n-io/backend/issues/2 'Add database module'
[1]: https://github.com/i19n-io/backend/issues/1 'Add Swagger'

<!-- Links to versions -->

[unreleased]: https://github.com/i19n-io/backend/compare/v0.0.0...HEAD
