import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG_NAMESPACE = 'database';

export const databaseConfig = registerAs(DATABASE_CONFIG_NAMESPACE, () => ({
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  name: process.env.DB_NAME as string,
  schema: process.env.DB_SCHEMA,
  connectionName: process.env.DB_CONNECTION_NAME,
}));

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
