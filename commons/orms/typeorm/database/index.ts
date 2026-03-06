import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import Config from "./config";

@Injectable()
export class DatabaseModule implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isLocalhost = true;
    const sslOptions = isLocalhost
      ? {}
      : {
          ssl: {
            rejectUnauthorized: false,
          },
        };

    return {
      type: "postgres",
      schema: Config.database.schema,
      host: Config.database.host,
      port: Config.database.port,
      username: Config.database.username,
      password: Config.database.password,
      database: Config.database.database,
      keepConnectionAlive: true,
      autoLoadEntities: true,
      logging: false,
      entities: [],
      extra: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        ...sslOptions,
      },
      ssl: isLocalhost ? false : sslOptions.ssl,
    } as TypeOrmModuleOptions;
  }
}
