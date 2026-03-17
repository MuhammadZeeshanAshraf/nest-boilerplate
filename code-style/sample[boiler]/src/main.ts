/* eslint-disable import/first */
import tracer from 'dd-trace';

tracer.init({
  env: process.env.DEPLOY_ENV || process.env.NODE_ENV,
  service: 'nestjs-service',
  profiling: true,
  runtimeMetrics: true,
});

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cluster from 'cluster';
import * as os from 'os';
import { AppModule } from './app.module';
import { SWAGGER_PATH } from './common/constants';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/reponse-format-interceptor';
import { TypeORMErrorInterceptor } from './common/interceptors/typeorm-error-interceptor';
import { ColoredLogger } from './common/logger/logger.service';
import './instrument';
import { getSwaggerConfiguration } from './swagger';

const numCPUs = os.cpus().length;
// console.info(`Detected ${numCPUs} CPU cores.`);
const clusterModule = cluster as unknown as cluster.Cluster;
const workers: Record<number, cluster.Worker> = {};
let index = 0;

const getWorkerIndex = () => {
  index += 1;
  if (index >= numCPUs) index = 0;
  return index;
};

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

// async function bootstrapWorker() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule, {
//     logger: ['log', 'error', 'warn', 'debug'],
//     rawBody: true,
//   });

//   app.useLogger(new ColoredLogger());
//   const configService: ConfigService = app.get(ConfigService);
//   const baseDomains = configService
//     .get<string>('BASE_FRONT_END_URLS')
//     .split(',');
//   const environment = configService.get<string>('NODE_ENV');

//   app.enableCors({
//     origin: (origin, callback) => {
//       if (['test', 'local', 'dev'].includes(environment)) {
//         return callback(null, true);
//       }
//       if (!origin) return callback(null, true);
//       try {
//         const allowedOrigins = [...baseDomains, /^chrome-extension:\/\/.+$/];
//         const isAllowed = allowedOrigins.some((allowedOrigin) =>
//           allowedOrigin instanceof RegExp
//             ? allowedOrigin.test(origin)
//             : origin.includes(allowedOrigin),
//         );
//         if (isAllowed) {
//           callback(null, true);
//         } else {
//           callback(new Error('Not allowed by CORS'));
//         }
//       } catch (error) {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     methods: ['PATCH', 'DELETE', 'HEAD', 'POST', 'PUT', 'GET', 'OPTIONS'],
//     credentials: true,
//     exposedHeaders: ['Content-Disposition'],
//   });

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//     }),
//   );

//   app.useGlobalInterceptors(
//     new ResponseInterceptor(),
//     new TypeORMErrorInterceptor(),
//     new ResponseTimeInterceptor(new ColoredLogger()),
//   );

//   app.useGlobalFilters(new GlobalExceptionFilter());

//   await getSwaggerConfiguration(app);

//   const server = await app.listen(0);

//   process.on('message', (message, connection: any) => {
//     if (message !== 'sticky-session:connection') return;
//     server.emit('connection', connection);
//     connection.resume();
//   });

//   const port = app.get(ConfigService).get<number>('PORT') || 3000;
//   const host = getLocalHost();
//   const swaggerUrl = `http://${host}:${port}${SWAGGER_PATH}/`;
//   const logger = new ColoredLogger();
//   logger.log(`Worker started. PID: ${process.pid}`);
//   logger.log(`Swagger available at: ${swaggerUrl}`);
// }

// async function bootstrap() {
//   if (clusterModule.isPrimary) {
//     console.log(`Master PID ${process.pid} — Starting ${numCPUs} workers`);

//     for (let i = 0; i < numCPUs; i++) {
//       workers[i] = clusterModule.fork();
//       workers[i].on('exit', (code, signal) => {
//         console.warn(
//           `Worker ${workers[i].process.pid} died (code: ${code}, signal: ${signal}). Restarting...`,
//         );
//         workers[i] = clusterModule.fork();
//       });
//     }

//     net
//       .createServer({ pauseOnConnect: true }, (connection) => {
//         const workerIndex = getWorkerIndex();
//         workers[workerIndex].send('sticky-session:connection', connection);
//       })
//       .listen(4000, () => {
//         console.log(`Master listening on port 4000`);
//       });
//   } else {
//     await bootstrapWorker();
//   }
// }

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
    rawBody: true,
  });
  app.useLogger(new ColoredLogger());
  const configService: ConfigService = app.get(ConfigService);
  // console.info('--- Loaded Environment Variables ---');
  for (const [key, value] of Object.entries(process.env)) {
    // console.info(`${key} = ${value}`);
  }
  // console.info('------------------------------------');

  const baseDomains = configService
    .get<string>('BASE_FRONT_END_URLS')
    .split(',');
  const environment = configService.get<string>('NODE_ENV');

  app.enableCors({
    origin: (origin, callback) => {
      // if (['test', 'local', 'dev'].includes(environment)) {
      //   return callback(null, true);
      // }
      return callback(null, true);
      // if (!origin) return callback(null, true);
      // try {
      //   const allowedOrigins = [...baseDomains, /^chrome-extension:\/\/.+$/];
      //   const isAllowed = allowedOrigins.some((allowedOrigin) =>
      //     allowedOrigin instanceof RegExp
      //       ? allowedOrigin.test(origin)
      //       : origin.includes(allowedOrigin),
      //   );

      //   if (isAllowed) {
      //     callback(null, true);
      //   } else {
      //     callback(new Error('Not allowed by CORS'));
      //   }
      // } catch (error) {
      //   callback(new Error('Not allowed by CORS'));
      // }
      // return callback(null, true);
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
    // new UserTrackingInterceptor(),
    // new ResponseTimeInterceptor(new ColoredLogger()),
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
