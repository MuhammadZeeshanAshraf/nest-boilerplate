import { ENVIRONMENTS } from 'src/common/constants/enums';
import { SYSTEM_ERROR_MESSAGES } from 'src/common/constants/errors';
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.nativeEnum(ENVIRONMENTS, {
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('NODE_ENV'),
  }),
  PORT: z.coerce.number({
    required_error: SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_NUMBER('PORT'),
  }),
  BASE_FRONT_END_URLS: z.string({
    required_error: SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING(
      'BASE_FRONT_END_URLS',
    ),
  }),
  DB_USERNAME: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('DB_USERNAME'),
  }),
  DB_PASSWORD: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('DB_PASSWORD'),
  }),
  DB_HOST: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('DB_USERNAME'),
  }),
  DB_PORT: z.coerce.number({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_NUMBER('DB_PORT'),
  }),
  DB_SCHEMA: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('DB_SCHEMA'),
  }),
  DB_NAME: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('DB_NAME'),
  }),
  JWT_ACCESS_SECRET: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('JWT_ACCESS_SECRET'),
  }),
  JWT_REFRESH_SECRET: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('JWT_REFRESH_SECRET'),
  }),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string({
    required_error: SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING(
      'JWT_ACCESS_TOKEN_EXPIRES_IN',
    ),
  }),
  SERVER_KEY: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('SERVER_KEY'),
  }),
  SERVER_IV: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('SERVER_IV'),
  }),
  X_API_KEY: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('X_API_KEY'),
  }),
  SWAGGER_USERNAME: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('SWAGGER_USERNAME'),
  }),
  SWAGGER_PASSWORD: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('SWAGGER_PASSWORD'),
  }),
  FROM_EMAIL: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('FROM_EMAIL'),
  }),
  MAILGUN_API_KEY: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('MAILGUN_API_KEY'),
  }),
  DOMAIN: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('DOMAIN'),
  }),
  OTP_VERIFICATION_EXPIRATION_MINUTES: z.string({
    required_error: SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING(
      'OTP_VERIFICATION_EXPIRATION_MINUTES',
    ),
  }),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string({
    required_error: SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING(
      'JWT_REFRESH_TOKEN_EXPIRES_IN',
    ),
  }),
  SENTRY_DSN: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('SENTRY_DSN'),
  }),
  SENTRY_AUTH_TOKEN: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('SENTRY_AUTH_TOKEN'),
  }),
  SALT_EDGE_BANK_API_URL: z.string({
    required_error: SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING(
      'SALT_EDGE_BANK_API_URL',
    ),
  }),
  SALT_EDGE_APP_ID: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('SALT_EDGE_APP_ID'),
  }),
  SALT_EDGE_API_SECRET: z.string({
    required_error: SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING(
      'SALT_EDGE_API_SECRET',
    ),
  }),
  MAGIC_BUDGET_URL: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('MAGIC_BUDGET_URL'),
  }),
  APPLE_CLIENT_ID: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('APPLE_CLIENT_ID'),
  }),
  AMPLITUDE_API_KEY: z.string({
    required_error:
      SYSTEM_ERROR_MESSAGES.REQUIRED_AND_MUST_BE_A_STRING('AMPLITUDE_API_KEY'),
  }),
});
export type Env = z.infer<typeof envSchema>;
