import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      uptime: process.uptime(),
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
