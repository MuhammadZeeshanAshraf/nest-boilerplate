import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { appConfig } from '../configuration/app.config';
import { databaseConfig } from '../configuration/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY, appConfig.KEY],
      useFactory: (
        db: ConfigType<typeof databaseConfig>,
        app: ConfigType<typeof appConfig>,
      ) => ({
        type: 'postgres',
        host: db.host,
        port: db.port,
        username: db.username,
        password: db.password,
        database: db.name,
        schema: db.schema,
        entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
        migrationsRun: false,
        synchronize: false,
        logging: app.nodeEnv === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
