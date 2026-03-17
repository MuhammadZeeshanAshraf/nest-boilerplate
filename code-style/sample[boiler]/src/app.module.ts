import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database';
import { SeederModule } from './common/database/seeders/seed.module';
import { ClearRedisInterceptor } from './common/interceptors/redis-interceptor';
import { LoggerModule } from './common/logger/logger.module';
import { CurlLoggerMiddleware } from './common/middlewares/logger.middleware';
import { AgreementModule } from './modules/agreement/agreement.module';
import { AmplitudeModule } from './modules/amplitude/amplitude.module';
import { AuthModule } from './modules/auth/auth.module';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { BudgetModule } from './modules/budget/budget.module';
import { CronModule } from './modules/crons/cron.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EmailModule } from './modules/email/email.module';
import { envSchema } from './modules/env/env';
import { EnvModule } from './modules/env/env.module';
import { ExchangeRateModule } from './modules/exchange-rate/exchange-rate.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { GcpModule } from './modules/gcp/gcp.module';
import { GocardlessModule } from './modules/gocardless/gocardless.module';
import { GoogleModule } from './modules/google/google.module';
import { HelpModule } from './modules/help/help.module';
import { IncomeModule } from './modules/income/income.module';
import { InviteModule } from './modules/invite/invite.module';
import { KafkaModule } from './modules/kafka/kafka.module';
import { KitModule } from './modules/kit/kit.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { MessageModule } from './modules/message/message.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OnboardModule } from './modules/onboard/onboard.module';
import { OtpModule } from './modules/otp/otp.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PotCategoryModule } from './modules/pot-category/pot-category.module';
import { PotModule } from './modules/pot/pot.module';
import { QuestioniesModule } from './modules/questionies/questionies.module';
import { QueueModule } from './modules/queus/queue.module';
import { RedisPermanentModule } from './modules/redis-permanent/redis-permanent.module';
import { RedisModuleClass } from './modules/redis/redis.module';
import { SpendingPersonalityModule } from './modules/spending-personalities/spending-personality.module';
import { TestAccountsModule } from './modules/test-accounts/test-accounts.module';
import { TokenModule } from './modules/token/token.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { TwilioModule } from './modules/twilio/twilio.module';
import { UserModule } from './modules/user/user.module';
import { ZipDataModule } from './modules/zip-data/zip-data.module';
import { CategorizationServiceModule } from './modules/categorization-service/categorization-service.module';
import { AssetModule } from './modules/assets/asset.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ScheduleModule.forRoot(),

    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseModule,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        function getRedisConfig() {
          const commonConfig = {
            redis: {
              host: configService.get('REDIS_HOST'),
              port: Number(configService.get('REDIS_PORT')),
              retryStrategy: () => {
                throw Error('Unable to connect to Redis');
              },
            },
          };
          const env = configService.get('NODE_ENV');
          if (env === 'local') {
            return commonConfig as BullRootModuleOptions;
          }
          commonConfig.redis['password'] = configService.get('REDIS_PASSWORD');
          return commonConfig as BullRootModuleOptions;
        }
        return getRedisConfig();
      },
      inject: [ConfigService],
    }),

    AutomapperModule.forRoot({
      strategyInitializer: classes(),
      // namingConventions: new CamelCaseNamingConvention(),
    }),
    /* Add Module in Alphabetical Order */

    AuthModule,
    AdminModule,
    AssetModule,
    AgreementModule,
    BankAccountModule,
    BudgetModule,
    CategorizationServiceModule,
    EnvModule,
    EmailModule,
    ExchangeRateModule,
    CronModule,
    ExpenseModule,
    KafkaModule,
    SeederModule,
    GoogleModule,
    GocardlessModule,
    GcpModule,
    IncomeModule,
    InviteModule,
    LoggerModule,
    MessageModule,
    OnboardModule,
    PotCategoryModule,
    PotModule,
    OtpModule,
    QueueModule,
    TransactionModule,
    TwilioModule,
    TokenModule,
    UserModule,
    QuestioniesModule,
    SpendingPersonalityModule,
    MerchantModule,
    RedisPermanentModule,
    RedisModuleClass,
    ZipDataModule,
    DashboardModule,
    NotificationModule,
    HelpModule,
    PaymentModule,
    TestAccountsModule,
    AmplitudeModule,
    KitModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClearRedisInterceptor,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ApiKeyGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(userContext: MiddlewareConsumer) {
    userContext
      .apply(CurlLoggerMiddleware)
      .exclude(
        {
          method: RequestMethod.ALL,
          path: '',
        },
        {
          method: RequestMethod.ALL,
          path: '/',
        },
        {
          method: RequestMethod.ALL,
          path: 'health',
        },
        {
          method: RequestMethod.ALL,
          path: 'nerobudget',
        },
        {
          method: RequestMethod.ALL,
          path: 'debug-sentry',
        },
        {
          method: RequestMethod.ALL,
          path: '.well-known/assetlinks.json',
        },
        {
          method: RequestMethod.ALL,
          path: '.well-known/apple-app-site-association',
        },
        '/auth/*',
      )
      .forRoutes('*');
  }
}
