# Socials Authentication Integration Guide

This guide provides a comprehensive overview of the Social Authentication (Apple, Google, Facebook) integrations in this project, covering installation, environment configuration, and usage patterns for both ID Token verification and Code Exchange.

---

## 1. Installation & Dependencies

To use the social authentication integrations, ensure the following dependencies are installed:

### Google

```bash
npm install axios google-auth-library
```

- `google-auth-library`: Official library for Google OAuth2 and ID Token verification. Only required for Id token Login.
- `axios`: Used for making HTTP requests to Facebook's Graph API.

### Apple

```bash
npm install axios apple-signin-auth jwks-rsa jsonwebtoken
```

- `apple-signin-auth`: Library for verifying Apple ID tokens and handling Apple Sign-In logic. Only required for Id token Login.
- `jwks-rsa`: Library for verifying Apple ID tokens and handling Apple Sign-In logic. Only required for Code Exchange Login.
- `jsonwebtoken`: Library for verifying Apple ID tokens and handling Apple Sign-In logic. Only required for Code Exchange Login.
- `axios`: Used for making HTTP requests to Facebook's Graph API.

### Facebook

```bash
npm install axios
```

- `axios`: Used for making HTTP requests to Facebook's Graph API.

---

## 2. Environment Configuration

Add the following variables to your `.env` file based on the providers you are using:

### Google Configuration

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Apple Configuration

#### Id token Login
```env
APPLE_CLIENT_ID=your-apple-app-id (iOS Bundle ID)
APPLE_SERVICE_ID_WEB=your-apple-service-id (Web)
```

#### Code Exchange Login
```env
APPLE_REDIRECT_URI=your-apple-redirect-uri
APPLE_CLIENT_ID=your-apple-app-id (iOS Bundle ID)
APPLE_PRIVATE_KEY=your-apple-private-key
APPLE_KEY_ID=your-apple-private-key-id
APPLE_TEAM_ID=your-apple-team-id
```

### Facebook Configuration

```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=your-facebook-redirect-uri
```

---

## 3. File Breakdown

The social authentication integrations are located in `integrations/authentications/socials/`. Each provider has two main implementation patterns:

### ID Token Login (`Id-login/`)

Used when the frontend (Mobile/Web) performs the login and sends an `id_token` or `access_token` to the backend for verification.

- **`google/Id-login/id-login.ts`**: Verifies Google ID tokens using `OAuth2Client`.
- **`apple/Id-login/id-login.ts`**: Verifies Apple ID tokens, supporting both `ios` and `web` platforms.
- **`facebook/Id-login/id-login.ts`**: Verifies Facebook access tokens via the Graph API `/me` endpoint.

### Code Exchange Login (`code-exchange-login/`)

Used for the standard OAuth2 authorization code flow where the backend exchanges a `code` for tokens.

- **`google/code-exchange-login/code-exchange.ts`**: Handles logic for generating auth URLs and exchanging codes for Google tokens.
- **`facebook/code-exchange-login/code-exchange.ts`**: Handles Facebook's OAuth dialog URLs and token exchange logic.

---

## 4. Usage Examples

### Verification via ID Token (Backend-as-a-Service approach)

#### Google

```typescript
const payload = await googleService.verifyIdToken(idToken, redirectUri);
// payload contains user email, name, sub (id), etc.
```

#### Apple

```typescript
const payload = await appleService.verifyIdToken(idToken, "ios");
// payload contains email, sub, etc.
```

#### Facebook

```typescript
const profile = await facebookService.verifyIdToken(accessToken);
// profile contains id, name, email, and picture.
```

### OAuth2 Code Exchange Flow

Typically involves two steps: redirecting the user to the provider and handling the callback.

#### Generating Authorization URL

```typescript
const url = await facebookExchangeService.generateUrl(state);
// Redirect user to this URL
```

#### Exchanging Code for Tokens

```typescript
const tokenData = await facebookExchangeService.exchangeCodeForToken(code);
const userInfo = await facebookExchangeService.fetchUserInfo(
  tokenData.access_token,
);
```

---

## 5. Security Best Practices

1. **Audience Verification**: Always ensure the `id_token` audience matches your Client ID (handled automatically by the services).
2. **Platform Specifics**: For Apple, ensure you distinguish between `ios` and `web` targets as they use different Client IDs.
3. **Secret Management**: Never expose `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_SECRET`, or Apple Private Keys on the frontend.
4. **State Parameter**: Use the `state` parameter in OAuth2 flows to prevent CSRF attacks.

---

## 6. Implementation Patterns

All services follow a consistent pattern:

- **Dependency Injection**: Use NestJS `ConfigService` for environment variables.
- **Type Safety**: Use interfaces for payloads (e.g., `TokenPayload` for Google, `AppleIdTokenType` for Apple).
- **Modularity**: Logic is separated into specific services per provider and per flow type.
