import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const env = configService.get<string>('NODE_ENV') || 'development';

  logger.log(`🚀 Application is running in [${env.toUpperCase()}] mode`);
  logger.log(`📡 Listening on: http://localhost:${port}`);
  logger.log(`📂 Database Host: ${configService.get('DB_NAME')}`);
  await app.listen(port);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
