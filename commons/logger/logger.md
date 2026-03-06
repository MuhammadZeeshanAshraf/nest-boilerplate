# Logger Module

A robust logging system providing enhanced console output, file persistence, and distributed tracing support.

## File Breakdown

### [logger.service.ts]
- **`ColoredLogger`**: Extends NestJS's `ConsoleLogger` to provide:
    - **File Logging**: Automatically appends logs to `app.log` at the project root for audit purposes.
    - **Traceability**: If `dd-trace` is active, it includes `trace_id` and `span_id` in every log entry, making it easier to track requests across microservices.
    - **Smart Stringification**: Safely handles objects and arrays, ensuring they are logged as readable JSON.
    - **Environment-Aware**: File writing can be toggled based on the `NODE_ENV`.

### [logger.module.ts]
- **`LoggerModule`**: A `@Global()` module that provides and exports `ColoredLogger`, making it available throughout the entire application without needing to import it in every module.

## Usage Guide

### Logging in Services
```typescript
@Injectable()
export class MyService {
  constructor(private readonly logger: ColoredLogger) {}

  doWork() {
    this.logger.log('Starting work...', { metadata: 'extra info' });
    try {
      // ...
    } catch (err) {
      this.logger.error(err);
    }
  }
}
```

### Logging Level Support
Includes support for: `log`, `info`, `error`, `warn`, `debug`, `verbose`, and a custom `extra` level.
