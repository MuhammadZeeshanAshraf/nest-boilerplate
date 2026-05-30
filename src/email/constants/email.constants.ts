export const EMAIL_PROVIDERS = {
  SES: 'ses',
  MAILGUN: 'mailgun',
  RESEND: 'resend',
} as const;

export type EmailProviderName =
  (typeof EMAIL_PROVIDERS)[keyof typeof EMAIL_PROVIDERS];

export const EMAIL_PROVIDER_LIST: EmailProviderName[] = Object.values(
  EMAIL_PROVIDERS,
);
