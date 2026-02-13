import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

class DatabaseVariables {
  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_DB: string;
}

export default registerAs('database', () => {
  const validatedConfig = plainToInstance(DatabaseVariables, process.env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Database Config Validation Error: ${errors.toString()}`);
  }

  return {
    host: validatedConfig.DB_HOST,
    port: validatedConfig.DB_PORT,
    user: validatedConfig.POSTGRES_USER,
    password: validatedConfig.POSTGRES_PASSWORD,
    name: validatedConfig.POSTGRES_DB,
  };
});
