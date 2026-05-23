import { Body, Controller, Get, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  track(@Body() body: { type: string; productId?: string; marketplaceId?: string; articleId?: string; sessionId?: string; properties?: Record<string, unknown> }) {
    return this.analyticsService.track(body);
  }

  @Get('dashboard')
  dashboard() {
    return this.analyticsService.dashboard();
  }
}
