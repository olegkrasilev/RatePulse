import { DataSource } from 'typeorm';

import databaseConfig from '../config/database/database.config';

const dbParams = databaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbParams.host,
  port: dbParams.port,
  username: dbParams.username,
  password: dbParams.password,
  database: dbParams.database,
  logging: dbParams.logging,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});
