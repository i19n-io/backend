# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

`@i19n/backend` — backend for an i18n (translations) service. Stores
projects, hierarchical translation keys (`token_key`) and values per language
(`token_value`). Authors authenticate via GitHub OAuth.

## Stack

- Node.js 24, npm 11, TypeScript (strict, decorators on)
- NestJS 11 + Fastify (`@nestjs/platform-fastify`)
- Drizzle ORM + `pg` (PostgreSQL)
- Passport + `passport-github` (GitHub OAuth)
- `class-validator` + `class-transformer` for DTO validation
- Swagger / OpenAPI 3.1.1 (`/swagger`, `/swagger/json`, `/swagger/yaml`)
- Vitest + `@testcontainers/postgresql` for e2e tests
- Path alias `~/*` → `src/*`, `~/e2e/*` → `e2e/*`

## Active migration: GraphQL → REST

We are migrating the API from GraphQL (Mercurius, `/gql`) to REST. The
migration is performed step by step, one endpoint at a time, on branch
`claude/graphql-to-rest-migration-6hud1`. Every step is discussed with the
user before code is written. See "Migration plan" below.

While migration is in progress, GraphQL and the new REST endpoints coexist.
GraphQL infrastructure (`@nestjs/graphql`, `@nestjs/mercurius`, `mercurius`,
`graphql`, `graphql-scalars`, `src/core/graphql/`) is removed only at the
final cleanup step.

### REST conventions (target style)

- Two top-level namespaces:
  - `/projects` — project CRUD (top-level resource)
  - `/tokens` — everything related to translation tokens (the consumer
    endpoint, plus token-key and token-value CRUD)
- Token URL map:
  ```
  GET    /tokens?projectId=…&key=…&lang=…&format=…       consumer
  GET    /tokens/keys?projectId=…&parentId=…             list keys
  GET    /tokens/keys/:id?projectId=…                    key by id
  POST   /tokens/keys?projectId=…                        create key
  GET    /tokens/keys/:keyId/values?projectId=…&langs=…  list values
  POST   /tokens/keys/:keyId/values?projectId=…          create value
  ```
- `projectId` is a **required query parameter** on every `/tokens/...` route
  (matches the existing consumer endpoint pattern). It both scopes the
  operation to a project and returns 404 on cross-project access.
- Verbs: `GET` list / `GET` by id / `POST` create / `PATCH` partial update.
- Validation through `class-validator` DTOs + global `ValidationPipe`
  (already configured in `src/helpers/setup/validation.ts`).
- DTOs documented with `@ApiProperty` (and helpers like `ApiPropertyUuid`
  in `src/core/proto/helpers/`). Existing GraphQL `@Field/@ObjectType/
@InputType` decorators stay until cleanup, but new REST DTOs should not
  rely on them.
- Errors: use Nest's built-in HTTP exceptions
  (`NotFoundException`, `ConflictException`, `BadRequestException`, …).
  The service layer keeps the `{ ok, data | error }` result shape;
  controllers map errors → HTTP exceptions. Don't leak GraphQL-specific
  errors through REST.
- Status codes: `201 Created` for `POST`, `200 OK` for reads / `PATCH`,
  `404` for "not found", `409` for "already exists / conflict".
- Pagination is not implemented yet (services have `// TODO: implement
pagination`). Don't add it as part of this migration unless asked.

### Project & author

`Project.author` is currently resolved via a Mercurius DataLoader. For REST,
embed the author inline (`{ id, name, … }`) on project responses by joining
in the service, or expose `authorId` only and add a separate
`GET /accounts/:id` if/when needed. The exact shape is decided per endpoint
during the migration discussion.

## Code style

- Single quotes, no semicolons (Prettier defaults from `.prettierrc`).
- Imports grouped/ordered by ESLint `import-x` rules; `~/` aliases are
  treated as internal.
- Don't add comments that just describe what code does; only document
  non-obvious WHY.
- Don't add features beyond the migration step under discussion.
  Refactors, abstractions, error-type unification (`// TODO: Use universal
result type`) are out of scope unless the user asks.
- Don't introduce backwards-compat shims for code we are migrating away
  from.

## Commands

- `npm run dev` — Nest in watch mode
- `npm run check` — runs all checks in parallel:
  - `check:code` — ESLint (`--max-warnings 0`)
  - `check:format` — Prettier
  - `check:spelling` / `check:spelling-unused` — cspell
  - `check:types` — `tsc --noEmit`
- `npm run fix` — auto-fix code, format, spelling
- `npm run test:unit` / `npm run test:e2e` — Vitest projects
- `npm run db:generate` / `db:migrate` / `db:push` — Drizzle Kit

E2E tests spin up Postgres via testcontainers (`e2e/global-setup.ts`) and
run `db:push` automatically — no local DB required.

Run `npm run check` and the relevant test suite before reporting an
endpoint migration as done.

## Migration plan (least → most important)

REST endpoint paths are proposals; finalize per step with the user.

| #   | Stage            | GraphQL op         | REST                                                                                                                                                                                          |
| --- | ---------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1-3 | TokenValue reads | `tokenValueList`   | `GET /tokens/keys/:keyId/values?projectId=…&langs=…` (covers also `tokenValueById`, `tokenValue` via `?langs=…`)                                                                              |
| 4   | TokenValue write | `tokenValueCreate` | `POST /tokens/keys/:keyId/values?projectId=…`                                                                                                                                                 |
| 5   | TokenKey reads   | `tokenKeyList`     | `GET /tokens/keys?projectId=…&parentId=…`                                                                                                                                                     |
| 6   | TokenKey reads   | `tokenKeyById`     | `GET /tokens/keys/:id?projectId=…`                                                                                                                                                            |
| 7   | TokenKey write   | `tokenKeyCreate`   | `POST /tokens/keys?projectId=…`                                                                                                                                                               |
| 8   | Project reads    | `projectList`      | `GET /projects`                                                                                                                                                                               |
| 9   | Project reads    | `projectById`      | `GET /projects/:id`                                                                                                                                                                           |
| 10  | Project writes   | `projectCreate`    | `POST /projects`                                                                                                                                                                              |
| 11  | Project writes   | `projectUpdate`    | `PATCH /projects/:id`                                                                                                                                                                         |
| 12  | Cleanup          | —                  | Remove `@nestjs/graphql`, `@nestjs/mercurius`, `mercurius`, `graphql`, `graphql-scalars`, `src/core/graphql/`, GraphQL decorators on models, GraphQL e2e helpers; rewrite e2e tests via REST. |

After each step:

1. Add controller + DTOs (REST, swagger).
2. Keep service unchanged where possible.
3. Add/extend e2e tests for the new REST endpoint.
4. `npm run check` + relevant tests pass.
5. Commit and push to `claude/graphql-to-rest-migration-6hud1`.
6. Discuss the next step before continuing.

Endpoints already REST and not part of the migration:

- `GET /auth/github`, `GET /auth/github/callback` — `GithubController`
- `GET /tokens?project=&key=&lang=&format=` — `TokenController`
  (consumer-facing, structured tree/flat output)
