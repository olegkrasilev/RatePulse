import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class AppVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;
}

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

  return {
    env: validatedConfig.NODE_ENV,
    port: validatedConfig.PORT,
  };
});
