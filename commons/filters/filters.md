# Filters Module

Exception filters provide a global mechanism to intercept and format error responses before they are sent to the client.

## File Breakdown

### [global-exception.filter.ts]
- **`GlobalExceptionFilter`**: The primary filter caught at the application level (or via `APP_FILTER` provider).

#### Key Functionality:
1.  **Uniform Response Structure**: Ensures all errors returned to the client follow the same format:
    ```json
    {
      "status": false,
      "statusCode": 403,
      "path": "/api/private-data",
      "message": "Forbidden resource",
      "timestamp": "2024-03-06T12:00:00Z",
      "errorCode": "FORBIDDEN", // Optional
      "data": null // Optional
    }
    ```
2.  **HTTP Exception Handling**: Gracefully extracts messages and status codes from standard NestJS `HttpException` instances.
3.  **Validation Error Formatting**: If multiple validation errors occur (e.g., from `ValidationPipe`), it Joins them into a single human-readable string.
4.  **Fallback Mechanism**: Any unknown `Error` objects are treated as `500 Internal Server Error`, ensuring no raw stack traces are leaked to the client while still providing a structured response.

## Integration

To use this globally, add it to your `main.ts`:

```typescript
app.useGlobalFilters(new GlobalExceptionFilter());
```
