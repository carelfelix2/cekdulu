import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { RunScrapingDto } from './dto/run-scraping.dto';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('jobs')
  jobs() {
    return this.scrapingService.jobs();
  }

  @Post('run')
  run(@Body() dto: RunScrapingDto) {
    return this.scrapingService.run(dto);
  }

  @Get('logs')
  logs() {
    return this.scrapingService.listLogs();
  }

  @Post('jobs/:id/results')
  ingestResults(
    @Param('id') id: string,
    @Body() body: { items?: Array<Record<string, unknown>>; keyword?: string; marketplace?: string; source?: string },
  ) {
    return this.scrapingService.ingestResults(id, body);
  }

  @Post('jobs/:id/failed')
  markFailed(@Param('id') id: string, @Body() body: { error?: string }) {
    return this.scrapingService.markFailed(id, body.error);
  }
}