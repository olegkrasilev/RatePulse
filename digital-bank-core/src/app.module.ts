import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app/app.config';
import databaseConfig from './config/database/database.config';
import { environmentValidationSchema } from './config/validation/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validationSchema: environmentValidationSchema,
      cache: true,
    }),
  ],
})
export class AppModule {}
