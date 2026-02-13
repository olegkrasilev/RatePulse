import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './common/config/app/app.config';
import databaseConfig from './common/config/database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
