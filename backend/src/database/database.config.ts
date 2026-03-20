import 'dotenv/config';
import { validate } from '../config/env.validation';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const env = validate(process.env);

export const databaseConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.NODE_ENV !== 'production',
  logging: env.NODE_ENV !== 'production' ? ['error', 'warn'] : false,
  extra: {
    max: env.NODE_ENV === 'test' ? 10 : 20,
  },
};
