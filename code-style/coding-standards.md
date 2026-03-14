# Coding Standards

This document outlines the coding standards and best practices for this repository. Adhering to these standards ensures code consistency, maintainability, and quality.

## Coding Patterns

- **Repository Pattern**: Always strive to follow the Repository Pattern for data access.
- **Naming Conventions**: Strictly follow the established naming conventions.
- **Interfaces over Types**: Prefer `interface` over `type` for defining object structures.
- **DTOs vs. Interfaces**:
    - Interfaces are preferred for general data structures.
    - Use Class-based DTOs only for request validation, or when extra transformation/validation logic is required for responses.
- **Mapping**: Use **AutoMapper** for mapping between entities and DTOs. For highly complex logic, custom mappers are acceptable.
- **Request Validation**: Always use class-based DTOs for incoming request validation.
- **Injectable Classes**: Always define an implementable interface for injectable classes. *Utility classes are an exception to this rule.*
- **Utilities**: Avoid creating multiple classes or files for one-off helper functions. Use a dedicated `utility` module for reusable helper code.
- **Documentation**: DTOs must be properly documented using **TSDoc/JSDoc** and integrated with API documentation tools like **Swagger**.

## Styling & Linting

- **Tooling**: Always enable **ESLint** and **Prettier** in your development environment.
- **Git Hooks**: **Husky** must be configured to run `lint-staged` for automated formatting and linting during commits.
- **Rules**: Configuration for linting and formatting is located in `lint-files/.eslintrc.js` and `lint-files/.prettierrc.js`.

## Comments & Documentation

- **JSDoc**: Always provide TSDoc/JSDoc documentation at the top of functions or classes to explain their purpose and parameters.
- **Self-Documenting Code**: Avoid redundant comments for code that is already self-explanatory.
- **Inline Comments**: Use inline comments only when strictly necessary to explain complex or non-obvious logic.
- **Descriptive Naming**: Use clear, descriptive names for variables and functions to minimize the need for explanatory comments.
- **Annotations**: Use VS Code extensions to highlight `TODO`, `FIXME`, and `DANGER` tags in the code.

## GitHub Workflow & Commits

### Commit Messages
Follow the **Conventional Commits** specification: `<type>(<scope>): <subject>`

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scope**: Optional, indicated in parentheses, e.g., `feat(auth): ...`.
- **Subject**:
    - Use the imperative mood (e.g., "add" instead of "added").
    - Use present tense.
    - Keep it lowercase.

**Example**: `feat(auth): add user authentication`

### Branch Management
Use descriptive branch names with appropriate prefixes:
- `feature/` (e.g., `feature/user-authentication`)
- `fix/` (e.g., `fix/login-bug`)
- `refactor/` (e.g., `refactor/auth-service`)
- `chore/` (e.g., `chore/update-dependencies`)
- `hotfix/`

**CI/CD**: Always use GitHub Actions for continuous integration and deployment.

## Dependency Management

- **Package Manager**: Always use `pnpm`.
- **Efficiency**:
    - Avoid redundant packages for the same functionality.
    - Prefer actively maintained and well-documented libraries.
    - Prioritize packages that are well-tested.
    - Use native code for simple tasks instead of adding a dependency.

## Security

- **Environment Variables**:
    - Validate all `env` variables before the server starts.
    - Maintain an up-to-date `.env.example` file.
    - Use environment variables for all sensitive information (secrets, keys, etc.).
- **Password Hashing**: Always use `bcrypt` for hashing passwords.
- **Config Management**: Avoid accessing `process.env` directly in application logic. Use a dedicated `env.ts` file or the **NestJS Configuration Module**.
    - *Example*: `env.ts`, `database.config.ts`, `auth.config.ts`.

## Architecture & Modularization

- **Structure**: Follow the Repository Pattern and feature-based modularization.
- **Common Module**: The following items belong in the `Common` module:
    - Middlewares, Interceptors, Guards, Filters, Decorators, Validators.
    - Constants and Enums.
    - Global Response/Error Message templates.
    - Shared DTOs.
    - Logger and Utility services.
    - Configuration files.

## Database

- **ORM**: Prefer **TypeORM** for RDBMS and **Mongoose** for NoSQL.
- **Organization**: Keep entities within their respective feature modules.
- **Audit Fields**: Every entity must include `createdAt`, `updatedAt`, and `deletedAt` fields.
- **Transactions**: Use database transactions for multi-step operations to ensure atomicity.
- **Integrity**: Never leave partial writes; ensure the system rolls back on failure.

## Naming Conventions

- **camelCase**: For variables, local constants, and function names.
- **PascalCase**: For class names, enums, global constants, interfaces, and types.

## Error Handling

- **Mechanisms**: Use `try-catch` blocks and `throw` statements appropriately.
- **Consistency**: Use a global exception filter for uniform API error responses.
- **Wrapping**: Do not throw raw errors from third-party libraries; wrap them in application-specific exceptions.
- **Centralization**: Use centralized error classes (e.g., `AppError`, `ValidationError`). NestJS built-in exception classes are preferred.
- **API Format**:
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "details": {}
}
```

## Logging

- **Production**: Disable `console.log` in production environments.
- **Service**: Use a centralized logger service.
- **Levels**: Appropriately utilize `debug`, `info`, `warn`, and `error` levels.
- **Privacy**: Never log sensitive data such as passwords, tokens, or PII.
- **Automation**: Handle request/response logging via middleware or interceptors.

## API Design

- **Restfulness**: Follow RESTful API design principles.
- **HTTP Methods**: Use GET, POST, PUT, DELETE, and PATCH correctly.
- **Patch/Put**: Use `PATCH` for partial updates and `PUT` for full replacements.
- **Resources**: Use plural names for resources (e.g., `/users`).
- **Standardization**: Ensure proper status codes, headers, and versioning.
- **Verbs**: Avoid verbs in endpoints (e.g., use `POST /users`, not `POST /createUser`).
- **Pagination**: Implement pagination for resources returning large datasets.
- **Documentation**: Document all endpoints and DTOs using **Swagger**.

## Validation

- **Request/Response**: Use `class-validator` for both request and response validation.
- **Coverage**: Every parameter, query, and body property must be validated.
- **Pragmatism**: Avoid excessive or redundant validation rules. Focus on what is necessary.
    - *Good*: `@IsString()`, `@IsNotEmpty()`
    - *Overkill*: Over-validating basic fields that don't require strict regex or length constraints unless necessary.

## Response Format

- **Typing**: Define proper interfaces/types for all return values.
- **Interceptors**: Use a common response interceptor to maintain a consistent format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## Performance

- **Optimization**:
    - Avoid unnecessary or redundant database queries.
    - Select only required fields (`SELECT` specific columns).
    - Utilize indexes for frequently queried columns.
- **Heavy Operations**: Use background jobs or batch processing for resource-intensive tasks.
- **Logic**: Avoid loops that execute database queries (N+1 problem).

## Project Structure

```text
src
├── common
│   ├── config
│   ├── constants
│   │   ├── enums
│   │   └── errors
│   ├── database
│   │   ├── migrations
│   │   ├── repositories
│   │   └── seeders
│   ├── decorators
│   ├── dtos
│   ├── entities
│   ├── exceptions
│   ├── filters
│   ├── guards
│   ├── interceptors
│   ├── interfaces
│   ├── logger
│   ├── middlewares
│   ├── pipes
│   ├── types
│   └── utils
├── modules
│   ├── auth
│   │   ├── controllers
│   │   ├── services
│   │   ├── repositories
│   │   │   └── interfaces
│   │   ├── interfaces
│   │   ├── dto
│   │   ├── mapping
│   │   └── entities
│   └── users
├── swagger
└── main.ts
```