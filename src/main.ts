import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { appConfig } from './configuration/app.config';
import { getSwaggerConfiguration } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const cfg = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin:
      cfg.corsOrigin === '*'
        ? true
        : cfg.corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  app.enableVersioning({ type: VersioningType.URI });
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await getSwaggerConfiguration(app);
  await app.listen(cfg.port);
}

bootstrap();
