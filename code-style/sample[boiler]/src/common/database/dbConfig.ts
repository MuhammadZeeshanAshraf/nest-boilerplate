import * as path from 'path';
import { DataSource } from 'typeorm';
import { Dummy } from 'src/modules/dummy/entities/dummy.entity';
import Config from './config';

const dataSource = new DataSource({
  type: 'postgres',
  schema: Config.database.schema,
  host: Config.database.host,
  port: Config.database.port,
  username: Config.database.username,
  password: Config.database.password,
  database: Config.database.database,
  entities: [Dummy],
  synchronize: false,
  logging: false,
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default dataSource;
