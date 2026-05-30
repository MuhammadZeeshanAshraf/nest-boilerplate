export type EmailAddress = string;

export interface EmailAttachment {
  filename: string;
  /**
   * Raw bytes (Buffer) or base64-encoded string. Providers that don't
   * support attachments natively will throw a clear error.
   */
  content: Buffer | string;
  contentType?: string;
}

interface BaseEmailPayload {
  /**
   * Sender address. Falls back to EMAIL_FROM env var when omitted.
   */
  from?: EmailAddress;
  to: EmailAddress | EmailAddress[];
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  replyTo?: EmailAddress | EmailAddress[];
  headers?: Record<string, string>;
  attachments?: EmailAttachment[];
}

export interface SendEmailPayload extends BaseEmailPayload {
  subject: string;
  text?: string;
  html?: string;
}

export interface SendTemplateEmailPayload extends BaseEmailPayload {
  /**
   * Provider-managed template identifier (e.g. SES template name or
   * Mailgun template name). Not supported by every provider — see the
   * EmailProvider implementation notes.
   */
  template: string;
  variables?: Record<string, unknown>;
  /**
   * Optional subject override. Some providers (e.g. SES) take subject
   * from the template itself; others may require it explicitly.
   */
  subject?: string;
}

export interface EmailSendResult {
  messageId: string;
  provider: string;
  acceptedAt: Date;
}

export const toAddressArray = (
  value: EmailAddress | EmailAddress[] | undefined,
): EmailAddress[] => {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
};
