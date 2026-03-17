# NestJS Project Boilerplate

A production-ready NestJS boilerplate with TypeORM, Swagger, and predefined folder structure.

## 1. Prerequisites

- **Node.js**: v20 or later
- **PNPM**: Installed globally (`npm install -g pnpm`)
- **PostgreSQL**: Running instance

## 2. Environment Variables

Create a `.env` file in the root directory and copy content from `.env.example`.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (dev/prod/qa/uat/local/test) | `dev` |
| `PORT` | Application port | `4000` |
| `X_API_KEY` | API Key | `secret` |
| `SERVER_IV` | Server IV | `secret` |
| `SERVER_KEY` | Server Key | `secret` |
| `BASE_FRONTEND_URLS` | Base Frontend URLs | `http://localhost:3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_NAME` | Database name | `postgres` |
| `SWAGGER_USERNAME` | Swagger Auth Username | `admin` |
| `SWAGGER_PASSWORD` | Swagger Auth Password | `admin` |
| `JWT_ACCESS_SECRET` | JWT Access Token Secret | `secret` |
| `JWT_REFRESH_SECRET` | JWT Refresh Token Secret | `secret` |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | JWT Access Token Expiration Time | `15m` |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | JWT Refresh Token Expiration Time | `7d` |

## 3. Setup & Installation

```bash
# Install dependencies
pnpm install

# Setup husky
pnpm run prepare
```

## 4. Running the Project

```bash
# Development mode
pnpm run start:dev

# Build project
pnpm run build

# Production mode
pnpm run start:prod
```

## 5. Database Migrations

```bash
# Generate a new migration
# Usage: pnpm run migration:generate --name=MigrationName
pnpm run migration:generate

# Run pending migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert

# Show migration status
pnpm run migration:show
```

## 6. Project Structure Overview

- `src/`: Main source code.
    - `common/`: Shared utilities, decorators, filters, and guards.
    - `modules/`: Feature-based modules (Auth, User, etc.).
- `public/`: Static internal files.
- `dist/`: Compiled output (after build).
- `test/`: E2E and unit test files.
