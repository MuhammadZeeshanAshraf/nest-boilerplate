import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { getSwaggerConfiguration } from './swagger';
import { ValidationPipe } from '@nestjs/common';
import { exceptionFilters } from './common/web/filters/index.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const configService: ConfigService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(...exceptionFilters);
  await getSwaggerConfiguration(app);
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
