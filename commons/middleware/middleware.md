# Middleware Module

Middleware functions are executed before the route handler, allowing for request inspection, logging, or modification.

## File Breakdown

### [logger.middleware.ts]
- **`CurlLoggerMiddleware`**: A specialized logging middleware designed for development and debugging.

#### Key Features:
1.  **CURL Conversion**: Every incoming request (Method, URL, Headers, Body) is reconstructed into its equivalent `curl` command.
2.  **Developer Efficiency**: Developers can copy the logged `curl` command directly from the terminal to postman or terminal to reproduce the exact request instantly.
3.  **Audit Trail**: Provides a clear view of exactly what the client sent, including sensitive headers if not explicitly filtered.

## Integration

To apply this middleware to all routes or specific ones, configure it in your `AppModule`:

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurlLoggerMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
```
