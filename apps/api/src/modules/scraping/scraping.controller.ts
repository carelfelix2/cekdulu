import { Body, Controller, Get, Post } from '@nestjs/common';
import { RunScrapeDto } from './dto/run-scrape.dto';
import { ScrapingService } from './scraping.service';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('jobs')
  jobs() {
    return this.scrapingService.jobs();
  }

  @Post('run')
  run(@Body() dto: RunScrapeDto) {
    return this.scrapingService.runManualScrape(dto);
  }
}