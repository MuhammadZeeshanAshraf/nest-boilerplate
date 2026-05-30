import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { SendEmailDto } from './send-email.dto';

export class SendTemplateEmailDto extends OmitType(SendEmailDto, [
  'subject',
  'text',
  'html',
] as const) {
  @ApiProperty({
    description:
      'Provider-managed template name/id. SES: template name; Mailgun: template name; Resend: not supported (will throw).',
    example: 'welcome-email',
  })
  @IsString()
  template: string;

  @ApiPropertyOptional({
    description: 'Template variables interpolated by the provider.',
    example: { name: 'Zeeshan', verificationLink: 'https://example.com/v/abc' },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;

  @ApiPropertyOptional({
    description:
      'Optional subject override. Mailgun honours this; SES takes subject from the template itself.',
    example: 'Welcome aboard',
  })
  @IsOptional()
  @IsString()
  subject?: string;
}
