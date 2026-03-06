import 'dotenv/config';
import { User } from '../modules/user/user.entity';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'ratepulse',
  entities: [User],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});
