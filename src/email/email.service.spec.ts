import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EMAIL_CONFIG_KEYS } from './config/email.config';
import { EmailService } from './email.service';
import { EmailProvider } from './interfaces/email-provider.interface';
import { EmailSendResult } from './types/send-email-payload.type';

describe('EmailService', () => {
  let service: EmailService;
  let provider: jest.Mocked<EmailProvider>;
  let config: jest.Mocked<Pick<ConfigService, 'get' | 'getOrThrow'>>;

  const result: EmailSendResult = {
    messageId: 'test-id',
    provider: 'test',
    acceptedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    provider = {
      send: jest.fn().mockResolvedValue(result),
      sendTemplate: jest.fn().mockResolvedValue(result),
    };

    config = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: EmailProvider, useValue: provider },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(EmailService);
  });

  describe('sendEmail', () => {
    it('delegates to the configured provider', async () => {
      const payload = {
        from: 'sender@example.com',
        to: 'to@example.com',
        subject: 'hi',
        text: 'hello',
      };

      const got = await service.sendEmail(payload);

      expect(provider.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'sender@example.com',
          to: 'to@example.com',
          subject: 'hi',
        }),
      );
      expect(got).toEqual(result);
    });

    it('falls back to EMAIL_FROM when `from` is omitted', async () => {
      config.getOrThrow.mockImplementation((key: string) => {
        if (key === EMAIL_CONFIG_KEYS.FROM) return 'default@example.com';
        throw new Error(`unexpected key: ${key}`);
      });

      await service.sendEmail({
        to: 'to@example.com',
        subject: 'hi',
        text: 'hello',
      });

      expect(provider.send).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'default@example.com' }),
      );
    });

    it('applies EMAIL_REPLY_TO when set and replyTo is omitted', async () => {
      config.getOrThrow.mockReturnValue('sender@example.com');
      config.get.mockImplementation((key: string) => {
        if (key === EMAIL_CONFIG_KEYS.REPLY_TO) return 'reply@example.com';
        return undefined;
      });

      await service.sendEmail({
        to: 'to@example.com',
        subject: 'hi',
        text: 'hello',
      });

      expect(provider.send).toHaveBeenCalledWith(
        expect.objectContaining({ replyTo: 'reply@example.com' }),
      );
    });

    it('propagates provider errors', async () => {
      provider.send.mockRejectedValueOnce(new Error('boom'));

      await expect(
        service.sendEmail({
          from: 'sender@example.com',
          to: 'to@example.com',
          subject: 'hi',
          text: 'hello',
        }),
      ).rejects.toThrow('boom');
    });
  });

  describe('sendTemplateEmail', () => {
    it('delegates to provider.sendTemplate with template + variables', async () => {
      const payload = {
        from: 'sender@example.com',
        to: 'to@example.com',
        template: 'welcome',
        variables: { name: 'Zeeshan' },
      };

      const got = await service.sendTemplateEmail(payload);

      expect(provider.sendTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'welcome',
          variables: { name: 'Zeeshan' },
        }),
      );
      expect(got).toEqual(result);
    });
  });
});
