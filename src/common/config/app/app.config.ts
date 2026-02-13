import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Logger } from '@nestjs/common';
import { AppVariables } from './app.schema';

const logger = new Logger('AppConfig');

export default registerAs('app', () => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  };

  const validatedConfig = plainToInstance(AppVariables, envVars, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`App Config Validation Error: ${errors.toString()}`);
  }

  logger.log(
    `✅ App Config loaded. Env: [${validatedConfig.NODE_ENV}], Port: [${validatedConfig.PORT}]`,
  );

  return {
    env: validatedConfig.NODE_ENV,
    port: validatedConfig.PORT,
  };
});
