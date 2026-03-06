// This configuration is used by typeorm migrations

import { config } from "dotenv";
import * as path from "path";
import { DataSource } from "typeorm";
import Config from "./config";
config();

const dataSource = new DataSource({
  type: "postgres",
  schema: Config.database.schema,
  host: Config.database.host,
  port: Config.database.port,
  username: Config.database.username,
  password: Config.database.password,
  database: Config.database.database,
  entities: [],
  synchronize: false,
  logging: false,
  migrations: [path.join(__dirname, "./migrations/*{.ts,.js}")],
  migrationsTableName: "migrations",
  ssl: {
    rejectUnauthorized: false,
  },
});

export default dataSource;
