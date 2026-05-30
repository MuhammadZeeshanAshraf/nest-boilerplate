import {
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
} from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
export class SesEmailProvider implements EmailProvider {
  private readonly logger = new Logger(SesEmailProvider.name);
  private client?: SESClient;

  constructor(private readonly config: ConfigService) {}

  async send(payload: SendEmailPayload): Promise<EmailSendResult> {
    this.assertNoAttachments(payload.attachments);

    const command = new SendEmailCommand({
      Source: payload.from,
      Destination: {
        ToAddresses: toAddressArray(payload.to),
        CcAddresses: toAddressArray(payload.cc),
        BccAddresses: toAddressArray(payload.bcc),
      },
      ReplyToAddresses: toAddressArray(payload.replyTo),
      Message: {
        Subject: { Data: payload.subject, Charset: 'UTF-8' },
        Body: {
          ...(payload.html
            ? { Html: { Data: payload.html, Charset: 'UTF-8' } }
            : {}),
          ...(payload.text
            ? { Text: { Data: payload.text, Charset: 'UTF-8' } }
            : {}),
        },
      },
    });

    const result = await this.getClient().send(command);
    return {
      messageId: result.MessageId ?? '',
      provider: EMAIL_PROVIDERS.SES,
      acceptedAt: new Date(),
    };
  }

  async sendTemplate(
    payload: SendTemplateEmailPayload,
  ): Promise<EmailSendResult> {
    this.assertNoAttachments(payload.attachments);

    const command = new SendTemplatedEmailCommand({
      Source: payload.from,
      Destination: {
        ToAddresses: toAddressArray(payload.to),
        CcAddresses: toAddressArray(payload.cc),
        BccAddresses: toAddressArray(payload.bcc),
      },
      ReplyToAddresses: toAddressArray(payload.replyTo),
      Template: payload.template,
      TemplateData: JSON.stringify(payload.variables ?? {}),
    });

    const result = await this.getClient().send(command);
    return {
      messageId: result.MessageId ?? '',
      provider: EMAIL_PROVIDERS.SES,
      acceptedAt: new Date(),
    };
  }

  private getClient(): SESClient {
    if (!this.client) {
      this.client = new SESClient({
        region: this.config.getOrThrow<string>(EMAIL_CONFIG_KEYS.AWS_SES_REGION),
        credentials: this.resolveCredentials(),
      });
      this.logger.log('SES client initialised');
    }
    return this.client;
  }

  private resolveCredentials() {
    const accessKeyId = this.config.get<string>(
      EMAIL_CONFIG_KEYS.AWS_SES_ACCESS_KEY_ID,
    );
    const secretAccessKey = this.config.get<string>(
      EMAIL_CONFIG_KEYS.AWS_SES_SECRET_ACCESS_KEY,
    );
    if (accessKeyId && secretAccessKey) {
      return { accessKeyId, secretAccessKey };
    }
    // Fall back to the default AWS credential provider chain
    // (env vars, shared config, IAM role, etc.)
    return undefined;
  }

  private assertNoAttachments(attachments: SendEmailPayload['attachments']) {
    if (attachments && attachments.length > 0) {
      throw new Error(
        'SES SendEmailCommand does not support attachments. Use Mailgun/Resend, or extend SesEmailProvider to call SendRawEmailCommand with a MIME payload.',
      );
    }
  }
}
