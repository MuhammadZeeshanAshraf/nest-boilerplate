# Guards Module

Guards are used to determine whether a request should be handled by the route handler or not, typically for authentication and authorization.

## File Breakdown

### [auth.guard.ts]
- **`AuthGuard`**: The standard JWT authentication guard.
    - **Functionality**:
        - Extracts `Bearer` token from the `Authorization` header.
        - Verifies the token against `JWT_ACCESS_SECRET`.
        - Attaches an `AppContext` instance to `req.context` for type-safe access to user data.
        - Attaches the decoded payload to `req.user`.
    - **Bypass**: Respects the `@Public()` decorator.


### [api-key.guard.ts]
- **`ApiKeyGuard`**: Validates requests based on a static API key.
    - **Usage**: Typically used for internal webhooks or service-to-service communication.
    - **Configuration**: Checks for the header defined in `ApiKeyGuard` (default: `123`) against `X_API_KEY` in environment.

## Integration

### Applying a Guard Globally
In your `AppModule` or `Main.ts`:
```typescript
{
  provide: APP_GUARD,
  useClass: AuthGuard,
}
```

### Type-Safe Context Access
Once `AuthGuard` is applied, you can access the user via the `req.context`:
```typescript
const userId = (req.context as AppContext).UserId;
```
