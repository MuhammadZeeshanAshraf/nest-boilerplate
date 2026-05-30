import {
  EmailSendResult,
  SendEmailPayload,
  SendTemplateEmailPayload,
} from '../types/send-email-payload.type';

/**
 * DI token for the active EmailProvider. Lives next to the interface
 * so importing the interface and the injection token is a single
 * import. The Symbol and the type share a name — TypeScript keeps
 * them in separate namespaces (value vs. type), so this is unambiguous.
 */
export const EmailProvider = Symbol('EmailProvider');

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
