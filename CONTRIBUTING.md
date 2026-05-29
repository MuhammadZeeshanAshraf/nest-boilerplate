# Contributing

Thanks for your interest in contributing! This document covers the workflow and conventions enforced by the tooling in this repo.

## Local setup

```bash
nvm use                 # picks the Node version pinned in .nvmrc
corepack enable         # enables pnpm via packageManager field
pnpm install
cp .env.example .env    # then edit values
pnpm start:dev
```

## Branch names

Branches are enforced by `validate-branch-name` (via the pre-commit hook). They must match one of:

- `main`, `development`, `staging`
- `feature/*`, `bug/*`, `hotfix/*`, `release/*`, `improvement/*`, `chore/*`, `docs/*`, `refactor/*`

## Commit messages

Commit messages are enforced by `commitlint` (via the commit-msg hook) using Conventional Commits with a custom type list:

```
ci | task | docs | feature | fix | refactor | revert | style | test | chore
```

Examples:

- `feature: add user search endpoint`
- `fix: handle null user-agent in logger middleware`
- `chore: bump @nestjs/throttler to v6`

## Pull requests

1. Open the PR against `main` (or `development` if your team uses GitFlow).
2. Fill in the PR template.
3. CI must be green: `lint:check`, `typecheck`, `test`, `test:e2e`, `build`.
4. At least one approval from a code owner.

## Local checks before pushing

```bash
pnpm lint:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

The pre-commit hook runs `validate-branch-name`, `lint-staged` (eslint + prettier on staged files), and `pnpm typecheck`. The commit-msg hook runs `commitlint`.

## Adding dependencies

- Runtime deps: `pnpm add <pkg>`
- Dev deps: `pnpm add -D <pkg>`

Commit the updated `pnpm-lock.yaml`.

## Database migrations

```bash
pnpm db:migrate:create src/database/migrations/AddSomething   # blank skeleton
pnpm db:migrate:generate src/database/migrations/AddSomething # diff against entities
pnpm db:migrate         # apply
pnpm db:migrate:revert  # roll back the most recent
pnpm db:migrate:show    # list applied/pending
```
