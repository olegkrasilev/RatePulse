import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvConfig } from './config/env.validation';
import morgan from 'morgan';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<EnvConfig, true>);
  const port = configService.get('PORT', { infer: true });
  const nodeEnv = configService.get('NODE_ENV', { infer: true });

  app.use(helmet());
  app.enableCors();
  app.use(compression());

  if (nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('RatePulse API')
    .setDescription('Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);

  const url = await app.getUrl();
  const displayUrl = url.replace('[::1]', 'localhost');

  logger.log(`🚀 Application is running on: ${displayUrl}/api`);
  logger.log(`📖 Swagger docs available at: ${displayUrl}/docs`);
  logger.log(`📦 Environment: ${nodeEnv.toUpperCase()}`);
}

void bootstrap();
