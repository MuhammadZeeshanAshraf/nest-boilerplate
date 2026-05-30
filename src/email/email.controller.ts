import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EMAIL_CONFIG_KEYS } from './config/email.config';
import { SendEmailDto } from './dto/send-email.dto';
import { SendTemplateEmailDto } from './dto/send-template-email.dto';
import { EmailService } from './email.service';
import {
  EmailAttachment,
  EmailSendResult,
} from './types/send-email-payload.type';

/**
 * Test/debug endpoints for exercising the EmailModule end-to-end with
 * each configured provider. The routes are unauthenticated — protect
 * or remove this controller before production deploys.
 */
@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  @Get('provider')
  @ApiOperation({
    summary: 'Get the active email provider',
    description:
      'Returns the provider selected by EMAIL_PROVIDER. Useful to confirm your env wiring before sending real emails.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: { provider: 'ses' },
    },
  })
  getActiveProvider(): { provider: string } {
    return {
      provider: this.config.getOrThrow<string>(EMAIL_CONFIG_KEYS.PROVIDER),
    };
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a one-off email',
    description:
      'Sends an email through the active provider. Attachments are base64-decoded server-side before being handed to the provider SDK. SES rejects attachments (use Mailgun/Resend or extend SesEmailProvider).',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        messageId: '<abc123@example.com>',
        provider: 'resend',
        acceptedAt: '2025-01-01T12:00:00.000Z',
      },
    },
  })
  async send(@Body() dto: SendEmailDto): Promise<EmailSendResult> {
    return this.emailService.sendEmail({
      ...dto,
      attachments: this.decodeAttachments(dto.attachments),
    });
  }

  @Post('send-template')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send an email using a provider-managed template',
    description:
      'SES and Mailgun support server-side templates. Resend does not — the call will throw with a clear error.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        messageId: '<abc123@example.com>',
        provider: 'ses',
        acceptedAt: '2025-01-01T12:00:00.000Z',
      },
    },
  })
  async sendTemplate(
    @Body() dto: SendTemplateEmailDto,
  ): Promise<EmailSendResult> {
    return this.emailService.sendTemplateEmail({
      ...dto,
      attachments: this.decodeAttachments(dto.attachments),
    });
  }

  private decodeAttachments(
    attachments: SendEmailDto['attachments'],
  ): EmailAttachment[] | undefined {
    return attachments?.map((file) => ({
      filename: file.filename,
      content: Buffer.from(file.content, 'base64'),
      contentType: file.contentType,
    }));
  }
}
