import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as os from 'os';
import { AppModule } from './app.module';
import { SWAGGER_PATH } from './common/constants';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/reponse-format-interceptor';
import { TypeORMErrorInterceptor } from './common/interceptors/typeorm-error-interceptor';
import { ColoredLogger } from './common/logger/logger.service';
import { getSwaggerConfiguration } from './swagger';

function getLocalHost(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
    rawBody: true,
  });
  app.useLogger(new ColoredLogger());
  const configService: ConfigService = app.get(ConfigService);

  const baseDomains = configService
    .get<string>('BASE_FRONTEND_URLS')
    .split(',');
  const environment = configService.get<string>('NODE_ENV');

  app.enableCors({
    origin: (origin, callback) => {
      if (['test', 'local', 'dev'].includes(environment)) {
        return callback(null, true);
      }
      if (!origin) return callback(null, true);
      try {
        const allowedOrigins = [...baseDomains, /^chrome-extension:\/\/.+$/];
        const isAllowed = allowedOrigins.some((allowedOrigin) =>
          allowedOrigin instanceof RegExp
            ? allowedOrigin.test(origin)
            : origin.includes(allowedOrigin),
        );

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } catch (error) {
        callback(new Error('Not allowed by CORS'));
      }
      return callback(null, true);
    },
    methods: ['PATCH', 'DELETE', 'HEAD', 'POST', 'PUT', 'GET', 'OPTIONS'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new TypeORMErrorInterceptor(),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await getSwaggerConfiguration(app);
  await app.listen(configService.get<number>('PORT'));

  const port = configService.get<number>('PORT') || 3000;
  const host = getLocalHost();

  const baseUrl = `http://${host}:${port}`;
  const swaggerUrl = `${baseUrl}${SWAGGER_PATH}/`;
  const logger = new ColoredLogger();
  logger.log(
    `Application is running on: \u001b]8;;${baseUrl}\u001b\\${baseUrl}\u001b]8;;\u001b\\`,
  );
  logger.log(
    `Swagger is available on: \u001b]8;;${swaggerUrl}\u001b\\${swaggerUrl}\u001b]8;;\u001b\\`,
  );
}
bootstrap();
