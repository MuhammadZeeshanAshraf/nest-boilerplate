# Interceptors Module

Interceptors permit you to transform the result returned from a function and transform the exception thrown from a function.

## File Breakdown

### [response-format.interceptor.ts]

- **`ResponseInterceptor`**: Automatically wraps all successful API responses into a unified structure.
  - **Envelope**:
    ```json
    {
      "status": true,
      "statusCode": 200,
      "path": "/api/resource",
      "message": "Success",
      "data": { ... },
      "timeTaken": "5.2 ms"
    }
    ```
  - **Serialization**: Safely handles `BigInt` values and avoids circular references or complex objects like Sockets.

### [typeorm-error-interceptor.ts]

- **`TypeORMErrorInterceptor`**: Catches `QueryFailedError` from TypeORM and maps database-specific error codes (e.g., PostgreSQL codes) to standard HTTP exceptions.
  - **Mappings**:
    - `23505` (Unique Violation) -> `ConflictException`
    - `23503` (Foreign Key Violation) -> `BadRequestException`
    - `23502` (Not Null Violation) -> `BadRequestException`

### [redis-interceptor.ts]

- **`ClearRedisInterceptor`**: A utility for cache invalidation.
  - **Functionality**: When applied to a route (usually a mutation like POST/PATCH/DELETE), it clears specified patterns from Redis after the successful execution of the handler. THis works with redis caching strategy at controller level. You can find the implementation in integrations.

## Usage

### Applying Interceptors

Usually applied globally in `main.ts`:

```typescript
app.useGlobalInterceptors(new ResponseInterceptor());
app.useGlobalInterceptors(new TypeORMErrorInterceptor());
```
