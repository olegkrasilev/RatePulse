import { z } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const { fieldErrors } = result.error.flatten();

    logger.error('❌ Environment validation failed:');

    Object.entries(fieldErrors).forEach(([field, errors]) => {
      logger.error(`Variable [${field}]: ${errors?.join(', ')}`);
    });

    throw new Error('Invalid .env configuration');
  }

  logger.log('✅ Environment variables validated successfully');

  return result.data;
}
