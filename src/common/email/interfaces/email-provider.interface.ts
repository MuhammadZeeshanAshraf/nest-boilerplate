import {
  EmailSendResult,
  SendEmailPayload,
  SendTemplateEmailPayload,
} from '../types/send-email-payload.type';

export interface EmailProvider {
  /**
   * Send a one-off email with subject + text/html body.
   */
  send(payload: SendEmailPayload): Promise<EmailSendResult>;

  /**
   * Send an email using a provider-managed template. Providers that
   * don't support server-side templates (e.g. Resend) throw a clear
   * error so the failure mode is obvious.
   */
  sendTemplate(payload: SendTemplateEmailPayload): Promise<EmailSendResult>;
}
