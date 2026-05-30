import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_CONFIG_KEYS } from './config/email.config';
import { EmailProvider } from './interfaces/email-provider.interface';
import {
  EmailSendResult,
  SendEmailPayload,
  SendTemplateEmailPayload,
  toAddressArray,
} from './types/send-email-payload.type';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(EmailProvider) private readonly provider: EmailProvider,
    private readonly config: ConfigService,
  ) {}

  async sendEmail(payload: SendEmailPayload): Promise<EmailSendResult> {
    const enriched = this.applyDefaults(payload);
    return this.run('sendEmail', enriched, () => this.provider.send(enriched));
  }

  async sendTemplateEmail(
    payload: SendTemplateEmailPayload,
  ): Promise<EmailSendResult> {
    const enriched = this.applyDefaults(payload);
    return this.run('sendTemplateEmail', enriched, () =>
      this.provider.sendTemplate(enriched),
    );
  }

  private applyDefaults<T extends Pick<SendEmailPayload, 'from' | 'replyTo'>>(
    payload: T,
  ): T {
    if (!payload.from) {
      payload.from = this.config.getOrThrow<string>(EMAIL_CONFIG_KEYS.FROM);
    }
    if (!payload.replyTo) {
      const fallback = this.config.get<string>(EMAIL_CONFIG_KEYS.REPLY_TO);
      if (fallback) payload.replyTo = fallback;
    }
    return payload;
  }

  private async run(
    operation: string,
    payload: SendEmailPayload | SendTemplateEmailPayload,
    action: () => Promise<EmailSendResult>,
  ): Promise<EmailSendResult> {
    const recipients = toAddressArray(payload.to);
    const subject = 'subject' in payload ? payload.subject : undefined;
    const template =
      'template' in payload
        ? (payload as SendTemplateEmailPayload).template
        : undefined;

    try {
      const result = await action();
      this.logger.log({
        msg: 'email accepted',
        operation,
        provider: result.provider,
        messageId: result.messageId,
        recipients: recipients.length,
        subject,
        template,
      });
      return result;
    } catch (error) {
      this.logger.error({
        msg: 'email send failed',
        operation,
        recipients: recipients.length,
        subject,
        template,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
