import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EmailAttachmentDto {
  @ApiProperty({ example: 'receipt.pdf' })
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'Base64-encoded file contents',
    example: 'JVBERi0xLjQKJcTl8uXrp...',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsOptional()
  @IsString()
  contentType?: string;
}

export class SendEmailDto {
  @ApiPropertyOptional({
    description:
      'Sender address. Falls back to EMAIL_FROM env var when omitted.',
    example: 'noreply@example.com',
  })
  @IsOptional()
  @IsEmail()
  from?: string;

  @ApiProperty({ type: [String], example: ['user@example.com'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  to: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  replyTo?: string[];

  @ApiProperty({ example: 'Welcome to the boilerplate' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ example: 'Plain-text body' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ example: '<p>HTML body</p>' })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ type: [EmailAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments?: EmailAttachmentDto[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { 'X-Entity-Ref-ID': 'abc-123' },
  })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;
}
