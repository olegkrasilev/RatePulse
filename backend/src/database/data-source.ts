import 'dotenv/config';
import { User } from '../modules/user/user.entity';
import { DataSource } from 'typeorm';
import { databaseConfig } from './database.config';
import { validate } from '../config/env.validation';

validate(process.env);
export default new DataSource({
  ...databaseConfig,
  entities: [User],
  migrations: ['src/database/migrations/*{.ts,.js}'],
});
