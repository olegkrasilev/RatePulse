import path from 'node:path';

import { DataSource } from 'typeorm';

import databaseConfig from '../config/database/database.config';

const dbParams = databaseConfig();
const rootPath = process.cwd();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbParams.host,
  port: dbParams.port,
  username: dbParams.username,
  password: dbParams.password,
  database: dbParams.database,
  logging: dbParams.logging,
  entities: [path.join(rootPath, 'src/**/*.entity{.ts,.js}')],
  migrations: [path.join(rootPath, 'src/database/migrations/*{.ts,.js}')],
  synchronize: false,
});
