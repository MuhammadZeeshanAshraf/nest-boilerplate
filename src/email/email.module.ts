import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_CONFIG_KEYS } from './config/email.config';
import {
  EMAIL_PROVIDERS,
  EMAIL_PROVIDER_LIST,
  EmailProviderName,
} from './constants/email.constants';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailProvider } from './interfaces/email-provider.interface';
import { MailgunEmailProvider } from './providers/mailgun-email.provider';
import { ResendEmailProvider } from './providers/resend-email.provider';
import { SesEmailProvider } from './providers/ses-email.provider';

@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [
    SesEmailProvider,
    MailgunEmailProvider,
    ResendEmailProvider,
    {
      provide: EmailProvider,
      inject: [
        ConfigService,
        SesEmailProvider,
        MailgunEmailProvider,
        ResendEmailProvider,
      ],
      useFactory: (
        config: ConfigService,
        ses: SesEmailProvider,
        mailgun: MailgunEmailProvider,
        resend: ResendEmailProvider,
      ): EmailProvider => {
        const logger = new Logger('EmailModule');
        const providerName = config.getOrThrow<string>(
          EMAIL_CONFIG_KEYS.PROVIDER,
        );

        if (!EMAIL_PROVIDER_LIST.includes(providerName as EmailProviderName)) {
          throw new Error(
            `Unsupported EMAIL_PROVIDER "${providerName}". Allowed: ${EMAIL_PROVIDER_LIST.join(', ')}.`,
          );
        }

        logger.log(`Using "${providerName}" as the default email provider`);

        switch (providerName as EmailProviderName) {
          case EMAIL_PROVIDERS.SES:
            return ses;
          case EMAIL_PROVIDERS.MAILGUN:
            return mailgun;
          case EMAIL_PROVIDERS.RESEND:
            return resend;
        }
      },
    },
    EmailService,
  ],
  exports: [
    EmailService,
    EmailProvider,
    SesEmailProvider,
    MailgunEmailProvider,
    ResendEmailProvider,
  ],
})
export class EmailModule {}
