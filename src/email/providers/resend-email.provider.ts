import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EMAIL_CONFIG_KEYS } from '../config/email.config';
import { EMAIL_PROVIDERS } from '../constants/email.constants';
import { EmailProvider } from '../interfaces/email-provider.interface';
import {
  EmailSendResult,
  SendEmailPayload,
  SendTemplateEmailPayload,
  toAddressArray,
} from '../types/send-email-payload.type';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private client?: Resend;

  constructor(private readonly config: ConfigService) {}

  async send(payload: SendEmailPayload): Promise<EmailSendResult> {
    if (!payload.from) {
      throw new Error('Resend requires an explicit `from` address.');
    }
    if (!payload.text && !payload.html) {
      throw new Error('Resend requires either `text` or `html` content.');
    }

    const { data, error } = await this.getClient().emails.send({
      from: payload.from,
      to: toAddressArray(payload.to),
      cc: toAddressArray(payload.cc),
      bcc: toAddressArray(payload.bcc),
      replyTo: toAddressArray(payload.replyTo),
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      headers: payload.headers,
      attachments: payload.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType,
      })),
    } as Parameters<Resend['emails']['send']>[0]);

    if (error) {
      throw new Error(`Resend rejected the email: ${error.message}`);
    }

    return {
      messageId: data?.id ?? '',
      provider: EMAIL_PROVIDERS.RESEND,
      acceptedAt: new Date(),
    };
  }

  async sendTemplate(
    _payload: SendTemplateEmailPayload,
  ): Promise<EmailSendResult> {
    throw new Error(
      'Resend does not support server-side templates. Render your template (e.g. with react-email) and pass the resulting HTML to sendEmail() instead.',
    );
  }

  private getClient(): Resend {
    if (!this.client) {
      this.client = new Resend(
        this.config.getOrThrow<string>(EMAIL_CONFIG_KEYS.RESEND_API_KEY),
      );
      this.logger.log('Resend client initialised');
    }
    return this.client;
  }
}
