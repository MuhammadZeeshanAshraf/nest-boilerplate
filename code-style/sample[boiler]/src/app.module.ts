import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database';
import { CurlLoggerMiddleware } from './common/middlewares/logger.middleware';
import { CronModule } from './modules/crons/cron.module';
import { envSchema } from './modules/env/env';
import { DummyModule } from './modules/dummy/dummy.module';

@Module({
  imports: [
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

    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    /* Add Module in Alphabetical Order */

    CronModule,
    DummyModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ApiKeyGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(userContext: MiddlewareConsumer) {
    userContext.apply(CurlLoggerMiddleware).forRoutes('*');
  }
}
