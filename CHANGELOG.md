# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Database wiring (`DatabaseModule`, TypeORM data source for the CLI, migrations folder)
- Postgres health indicator on `/health`
- Docker support: multi-stage `Dockerfile` and `docker-compose.yml` (app + Postgres)
- `scripts/rename-project.sh` to rename the boilerplate on first use
- GitHub PR & issue templates, `CODEOWNERS`
- `CONTRIBUTING.md`

### Changed

- Tightened env validation to require `DB_*` variables now that the database module ships by default

## [0.1.0] - boilerplate refresh

Refresh of the original NestJS starter:

- Modernised toolchain (Nest 11, TypeScript strict, ESLint 9 flat config, Prettier 3, Husky 9, commitlint 19)
- Added production essentials (helmet, compression, configurable CORS, URI versioning, graceful shutdown, Pino structured logging with request-id, global response interceptor, health endpoint)
- Consolidated exception filters into a single `AllExceptionsFilter` registered via `APP_FILTER`
- Switched to pnpm, committed `pnpm-lock.yaml`, removed `package-lock.json`
- Wired the Joi env validation schema into `ConfigModule`
- Fixed multiple typos and dead code paths
