# Constants Module

This module contains application-wide constant values, error messages, and shared enumerations to ensure consistency across the codebase.

## File Breakdown

### [index.ts]

Contains general configuration and response constants:

- **Project Info**: `PROJECT_NAME` (Backend identifier), `SWAGGER_PATH`.
- **Auth Keys**: `JWT`, `X_API_KEY`.
- **Pagination Defaults**: `DEFAULT_PAGE`, `PAGE_SIZE`.
- **RESPONSE_MESSAGES**: A central registry for success messages (e.g., `CREATED`, `UPDATED`, `DELETED`, `ACTIVATED`) to keep API responses uniform.
- **EMAIL_SUBJECT**: Subjects for system-generated emails like registration verification and password resets.
- **DUMMY_DATA**: Mock data for development and testing.

### [enums/index.ts]

- `ENVIRONMENTS`: Defines valid runtime environments: `dev`, `qa`, `uat`, `prod`, `test`, `local`.

### [errors/index.ts]

Standardized error message templates:

- `SYSTEM_ERROR_MESSAGES`: Used during environment and configuration validation.
- `APP_ERROR_MESSAGES`: Used for business logic failures (e.g., `USER_NOT_FOUND`).

## Usage Examples

### Using Response Messages in Controllers

```typescript
return {
  message: RESPONSE_MESSAGES.UPDATED,
  data: updatedEntity,
};
```

### Checking Environment

```typescript
if (process.env.NODE_ENV === ENVIRONMENTS.PROD) {
  // Production specific logic
}
```
