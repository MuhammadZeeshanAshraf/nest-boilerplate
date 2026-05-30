import { registerAs } from '@nestjs/config';

export type NodeEnvironment = 'development' | 'production' | 'test';

export const APP_CONFIG_NAMESPACE = 'app';

export const appConfig = registerAs(APP_CONFIG_NAMESPACE, () => ({
  nodeEnv: (process.env.NODE_ENV as NodeEnvironment) ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
}));

export type AppConfig = ReturnType<typeof appConfig>;
