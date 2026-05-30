import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { EMAIL_CONFIG_KEYS } from '../config/email.config';
import { EMAIL_PROVIDERS } from '../constants/email.constants';
import { EmailProvider } from '../interfaces/email-provider.interface';
import {
  EmailAttachment,
  EmailSendResult,
  SendEmailPayload,
  SendTemplateEmailPayload,
  toAddressArray,
} from '../types/send-email-payload.type';

type MailgunClient = ReturnType<InstanceType<typeof Mailgun>['client']>;

@Injectable()
export class MailgunEmailProvider implements EmailProvider {
  private readonly logger = new Logger(MailgunEmailProvider.name);
  private client?: MailgunClient;
  private domain?: string;

  constructor(private readonly config: ConfigService) {}

  async send(payload: SendEmailPayload): Promise<EmailSendResult> {
    const message = {
      from: payload.from,
      to: toAddressArray(payload.to),
      cc: toAddressArray(payload.cc),
      bcc: toAddressArray(payload.bcc),
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      ...this.buildReplyTo(payload.replyTo),
      ...this.buildHeaders(payload.headers),
      ...this.buildAttachments(payload.attachments),
    };

    const result = await this.getClient().messages.create(
      this.getDomain(),
      message as Parameters<MailgunClient['messages']['create']>[1],
    );

    return {
      messageId: result.id ?? '',
      provider: EMAIL_PROVIDERS.MAILGUN,
      acceptedAt: new Date(),
    };
  }

  async sendTemplate(
    payload: SendTemplateEmailPayload,
  ): Promise<EmailSendResult> {
    const message = {
      from: payload.from,
      to: toAddressArray(payload.to),
      cc: toAddressArray(payload.cc),
      bcc: toAddressArray(payload.bcc),
      subject: payload.subject,
      template: payload.template,
      ...(payload.variables
        ? { 'h:X-Mailgun-Variables': JSON.stringify(payload.variables) }
        : {}),
      ...this.buildReplyTo(payload.replyTo),
      ...this.buildHeaders(payload.headers),
      ...this.buildAttachments(payload.attachments),
    };

    const result = await this.getClient().messages.create(
      this.getDomain(),
      message as Parameters<MailgunClient['messages']['create']>[1],
    );

    return {
      messageId: result.id ?? '',
      provider: EMAIL_PROVIDERS.MAILGUN,
      acceptedAt: new Date(),
    };
  }

  private getClient(): MailgunClient {
    if (!this.client) {
      const mailgun = new Mailgun(formData);
      const region = this.config.get<string>(EMAIL_CONFIG_KEYS.MAILGUN_REGION);
      this.client = mailgun.client({
        username: 'api',
        key: this.config.getOrThrow<string>(EMAIL_CONFIG_KEYS.MAILGUN_API_KEY),
        url:
          region === 'eu'
            ? 'https://api.eu.mailgun.net'
            : 'https://api.mailgun.net',
      });
      this.logger.log(`Mailgun client initialised (region: ${region ?? 'us'})`);
    }
    return this.client;
  }

  private getDomain(): string {
    if (!this.domain) {
      this.domain = this.config.getOrThrow<string>(
        EMAIL_CONFIG_KEYS.MAILGUN_DOMAIN,
      );
    }
    return this.domain;
  }

  private buildReplyTo(replyTo: SendEmailPayload['replyTo']) {
    const addresses = toAddressArray(replyTo);
    return addresses.length > 0 ? { 'h:Reply-To': addresses.join(',') } : {};
  }

  private buildHeaders(headers: SendEmailPayload['headers']) {
    if (!headers) return {};
    // Mailgun accepts arbitrary headers as `h:Header-Name` keys.
    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [`h:${key}`, value]),
    );
  }

  private buildAttachments(attachments?: EmailAttachment[]) {
    if (!attachments || attachments.length === 0) return {};
    return {
      attachment: attachments.map((file) => ({
        filename: file.filename,
        data: file.content,
        contentType: file.contentType,
      })),
    };
  }
}
