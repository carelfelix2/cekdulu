import { Module } from '@nestjs/common';
import { ScrapedProductsController } from './scraped-products.controller';
import { ScrapedProductsService } from './scraped-products.service';

@Module({
  controllers: [ScrapedProductsController],
  providers: [ScrapedProductsService],
  exports: [ScrapedProductsService]
})
export class ScrapedProductsModule {}