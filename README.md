# Nest Boilerplate

A reusable NestJS starter template. Clone, rename, and start building.

> This boilerplate is being actively refreshed. See the Roadmap section at the bottom for what's landing across the upcoming releases.

## Current Stack

- **NestJS 10** on the Express platform
- **TypeScript 5**
- **Swagger** (`/api`) with bearer-auth UI scaffolding
- **Rate limiting** via `@nestjs/throttler` (env-configurable)
- **Scheduling** via `@nestjs/schedule` with an example cron module
- **Validation** via `class-validator` + `class-transformer` + a Joi env schema
- **Husky + commitlint + validate-branch-name** for git hygiene
- **GitHub Actions** for commit-message linting

## Prerequisites

- **Node.js** `>= 20` (use the version pinned in `.nvmrc` — currently `22`)
- **pnpm** `>= 9` (the only supported package manager)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/MuhammadZeeshanAshraf/nest-boilerplate.git my-project
cd my-project

# 2. Install dependencies
pnpm install

# 3. Configure env
cp .env.example .env
# then edit .env with your values

# 4. Run in dev mode (hot reload)
pnpm start:dev
```

The server listens on `PORT` from your `.env`. Swagger UI is available at `http://localhost:<PORT>/api`.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
NODE_ENV=development
PORT=3000

THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

Database variables (`DB_*`) are listed in `.env.example` for future use — the database module itself ships in a later release of this boilerplate.

## Scripts

| Command | Description |
|---|---|
| `pnpm start` | Start in production mode |
| `pnpm start:dev` | Start with hot reload |
| `pnpm start:debug` | Start with `--inspect` debugger |
| `pnpm start:prod` | Run the compiled output from `dist/` |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm lint` | Lint and auto-fix `src/`, `test/` |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run e2e tests |
| `pnpm test:cov` | Run tests with coverage report |

## Folder Structure

```
src/
├── main.ts                    # Bootstrap
├── app.module.ts              # Root module
├── app.controller.ts          # Health-check root route
├── app.service.ts
├── configuration/             # Env validation schema (Joi)
├── common/
│   ├── constants/             # PROJECT_NAME, page sizes, throttle defaults
│   ├── dtos/                  # Shared request/response DTOs
│   ├── interfaces/
│   ├── types/                 # Custom error model hierarchy + PagedList
│   └── web/                   # BaseController, ResponseFactory, exception filters
├── crons/                     # Scheduled jobs (one example)
├── middlewares/               # Express middlewares (logger)
└── swagger/                   # Swagger doc builder
```

## Git Conventions

### Branch names

Branches must match one of:

- `main`, `development`, `staging`
- `feature/*`, `bug/*`, `hotfix/*`, `release/*`, `improvement/*`, `chore/*`, `docs/*`, `refactor/*`

The pre-commit hook enforces this via `validate-branch-name`.

### Commit messages

Conventional Commits with a custom type list (enforced by commitlint):

```
ci | task | docs | feature | fix | refactor | revert | style | test | chore
```

Example: `feature: add user search endpoint`.

## Roadmap

This boilerplate is being refreshed in five stages. Items already shipped are checked.

- [x] Repo hygiene, pnpm consolidation, lock-file fix
- [ ] Bug fixes (Joi schema wiring, e2e test, exception filters, typos, logger)
- [ ] Modernize toolchain (Nest 11, TS strict, ESLint 9 flat, Prettier 3, path aliases, CI pipeline)
- [ ] Production essentials (helmet, CORS, compression, API versioning, graceful shutdown, structured logging via Pino, global response interceptor, health endpoint)
- [ ] Database wiring (TypeORM + Postgres), Docker support, project-rename script, GitHub PR/issue templates

## License

MIT — see [LICENSE](LICENSE).
