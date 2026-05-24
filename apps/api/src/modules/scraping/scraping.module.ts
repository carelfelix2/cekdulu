import { Module } from '@nestjs/common';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [ScrapingController],
  providers: [ScrapingService],
  exports: [ScrapingService]
})
export class ScrapingModule {}