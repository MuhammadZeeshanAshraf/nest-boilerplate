/**
 * Typed accessor keys for email-related env vars. Keep them centralised
 * here so providers, the validation schema, and any future tooling all
 * reference the same set of names.
 */
export const EMAIL_CONFIG_KEYS = {
  PROVIDER: 'EMAIL_PROVIDER',
  FROM: 'EMAIL_FROM',
  REPLY_TO: 'EMAIL_REPLY_TO',

  AWS_SES_REGION: 'AWS_SES_REGION',
  AWS_SES_ACCESS_KEY_ID: 'AWS_SES_ACCESS_KEY_ID',
  AWS_SES_SECRET_ACCESS_KEY: 'AWS_SES_SECRET_ACCESS_KEY',

  MAILGUN_API_KEY: 'MAILGUN_API_KEY',
  MAILGUN_DOMAIN: 'MAILGUN_DOMAIN',
  MAILGUN_REGION: 'MAILGUN_REGION',

  RESEND_API_KEY: 'RESEND_API_KEY',
} as const;

export type EmailConfigKey =
  (typeof EMAIL_CONFIG_KEYS)[keyof typeof EMAIL_CONFIG_KEYS];
