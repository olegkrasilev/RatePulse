import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    throw new Error('boom');
    return { status: 'ok' };
  }
}
