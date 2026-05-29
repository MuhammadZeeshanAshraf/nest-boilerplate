# Nest Boilerplate

A production-ready NestJS starter template. Clone, rename, configure env, and ship.

## Stack

- **NestJS 11** on Express 5
- **TypeScript 5.6** with `strict: true` and a `@/*` path alias
- **PostgreSQL** via TypeORM (env-driven `DatabaseModule` + CLI data source + migrations folder)
- **Validation**: `class-validator` + `class-transformer` + Joi for `process.env` (wired into `ConfigModule`)
- **Security**: `helmet`, `compression`, configurable CORS
- **Rate limiting**: `@nestjs/throttler` v6 (env-configurable)
- **Scheduling**: `@nestjs/schedule` with an example cron module
- **Structured logging**: `nestjs-pino` (JSON in prod, pretty in dev), automatic request-id propagation
- **Global response interceptor** wrapping all successes in a typed envelope; opt-out via `@SkipResponseWrap()`
- **Global exception filter** mapping every exception into the same envelope
- **Health endpoint** at `/health` powered by `@nestjs/terminus` (includes a Postgres ping)
- **URI versioning** + **graceful shutdown hooks**
- **Swagger** UI at `/api`
- **ESLint 9** (flat config) + **Prettier 3** + **lint-staged**
- **Husky 9 + commitlint 19 + validate-branch-name** for git hygiene
- **GitHub Actions**: lint, typecheck, test, e2e, build on every PR
- **Docker**: multi-stage `Dockerfile`, `docker-compose.yml` (app + Postgres)

## Prerequisites

- **Node.js** `>= 20` (use the version pinned in `.nvmrc` — currently `22`)
- **pnpm** `>= 9` (enable with `corepack enable`)
- **Docker** (only if you use the docker-compose workflow)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/MuhammadZeeshanAshraf/nest-boilerplate.git my-project
cd my-project

# 2. Rename the project everywhere (package.json, README, constants, env, compose)
./scripts/rename-project.sh my-project "My Project"

# 3. Reset git history (optional but recommended)
rm -rf .git && git init && git add -A && git commit -m "chore: initial commit"

# 4. Install deps
corepack enable
pnpm install

# 5. Configure env
cp .env.example .env
# edit .env (DB_*, PORT, etc.)

# 6. Run Postgres (option A: docker-compose, option B: your own)
docker compose up -d db
pnpm db:migrate          # no-op the first time; creates migrations table

# 7. Run the app
pnpm start:dev
```

The server listens on `PORT`. Swagger UI is at `http://localhost:<PORT>/api`. Health check is at `http://localhost:<PORT>/health`.

## Environment Variables

All variables in `.env.example` are validated by the Joi schema in `src/configuration/validation/env.validation.ts`. Required vars cause boot to fail if missing.

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | yes | `development` \| `production` \| `test` |
| `PORT` | yes | HTTP port |
| `LOG_LEVEL` | no | Pino level (`trace`..`silent`); defaults to `info` |
| `CORS_ORIGIN` | no | `*` or comma-separated allowlist; defaults to `*` |
| `DB_HOST` | yes | Postgres host |
| `DB_PORT` | yes | Postgres port |
| `DB_USERNAME` | yes | Postgres user |
| `DB_PASSWORD` | yes | Postgres password |
| `DB_NAME` | yes | Postgres database |
| `DB_SCHEMA` | no | Postgres schema (defaults to `public`) |
| `DB_CONNECTION_NAME` | no | Named connection (only needed for multi-DB setups) |
| `THROTTLE_TTL` | yes | Throttle window (seconds) |
| `THROTTLE_LIMIT` | yes | Max requests per window |

## Scripts

| Command | What it does |
|---|---|
| `pnpm start` / `pnpm start:dev` / `pnpm start:debug` | Run the app |
| `pnpm start:prod` | Run the compiled output (`dist/`) |
| `pnpm build` | Compile to `dist/` |
| `pnpm lint` / `pnpm lint:check` | ESLint (fix vs check-only) |
| `pnpm format` | Prettier write |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` / `pnpm test:e2e` / `pnpm test:cov` | Jest |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:migrate:revert` | Roll back the most recent migration |
| `pnpm db:migrate:show` | List applied/pending migrations |
| `pnpm db:migrate:generate <path>` | Generate a migration from entity diff |
| `pnpm db:migrate:create <path>` | Generate a blank migration skeleton |

## Folder Structure

```
.
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .github/
│   ├── workflows/ci.yml       # lint + typecheck + test + e2e + build
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   └── CODEOWNERS
├── .husky/                    # commit-msg + pre-commit hooks
├── scripts/
│   └── rename-project.sh      # rename boilerplate on first use
├── src/
│   ├── main.ts                # Bootstrap: helmet, compression, CORS, versioning, shutdown, Pino
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts      # Liveness ping at `/`
│   ├── app.service.ts
│   ├── configuration/         # Joi env validation schema
│   ├── common/
│   │   ├── constants/         # PROJECT_NAME, page sizes, throttle defaults
│   │   ├── decorators/        # @SkipResponseWrap()
│   │   ├── dtos/              # Shared request/response DTOs (envelope models)
│   │   ├── interceptors/      # ResponseInterceptor (success envelope)
│   │   ├── interfaces/
│   │   ├── types/             # Error model hierarchy + PagedList
│   │   └── web/               # BaseController, ResponseFactory, global exception filter
│   ├── crons/                 # Scheduled jobs (one example)
│   ├── database/              # TypeORM DataSource + DatabaseModule + migrations/
│   ├── health/                # /health endpoint (Terminus + Postgres ping)
│   └── swagger/               # Swagger doc builder
└── test/
    └── app.e2e-spec.ts
```

## Response shape

Every successful response is wrapped by the global `ResponseInterceptor`:

```json
{
  "status": true,
  "message": "Success",
  "code": 200,
  "data": { /* your handler's return value */ },
  "error": null
}
```

Every exception is mapped by `AllExceptionsFilter` to the same shape with `status: false`, the appropriate HTTP code, and an `error` object. Stack traces are only included when `NODE_ENV=development`.

To opt out (e.g. for streamed responses or external-shape endpoints like `/health`), annotate the handler with `@SkipResponseWrap()`.

## Docker

```bash
# Spin up app + db together
docker compose up --build

# Just the database (useful for local dev outside docker)
docker compose up -d db
```

The Dockerfile is multi-stage: a `runner` stage that contains only `dist/`, production deps, and an unprivileged user.

## Database migrations

```bash
# Create a blank migration
pnpm db:migrate:create src/database/migrations/AddUsersTable

# Or generate one from your entity changes
pnpm db:migrate:generate src/database/migrations/AddUsersTable

# Apply pending migrations
pnpm db:migrate

# Roll back the most recent
pnpm db:migrate:revert
```

The CLI data source lives at [src/database/data-source.ts](src/database/data-source.ts). It loads `.env` directly (independent of NestJS) so it works from plain `pnpm typeorm ...` commands.

## Git Conventions

### Branches

Branches must match one of:

- `main`, `development`, `staging`
- `feature/*`, `bug/*`, `hotfix/*`, `release/*`, `improvement/*`, `chore/*`, `docs/*`, `refactor/*`

### Commit messages

Conventional Commits with a custom type list (enforced by commitlint):

```
ci | task | docs | feature | fix | refactor | revert | style | test | chore
```

Example: `feature: add user search endpoint`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution workflow.

## Deployment notes

- The `runner` stage in [Dockerfile](Dockerfile) is what you ship: it has no devDeps, no source, and runs as an unprivileged user.
- Set `NODE_ENV=production` so Pino emits JSON (suitable for log aggregators).
- Set `CORS_ORIGIN` to your frontend's origin(s); leaving it as `*` is fine for internal APIs but not for credential-bearing browser requests.
- `app.enableShutdownHooks()` makes Nest tear down gracefully on `SIGTERM` / `SIGINT` — important for zero-downtime rolling deploys.
- The `/health` endpoint is what your load balancer / orchestrator should poll. It includes a Postgres ping so an unhealthy DB takes the pod out of rotation.

## License

MIT — see [LICENSE](LICENSE).
