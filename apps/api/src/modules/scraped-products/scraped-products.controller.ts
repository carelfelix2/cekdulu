import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ScrapedProductsService } from './scraped-products.service';

@Controller('scraped-products')
export class ScrapedProductsController {
  constructor(private readonly service: ScrapedProductsService) {}

  @Get()
  list(@Query('q') q?: string, @Query('marketplaceId') marketplaceId?: string) {
    return this.service.list({ keyword: q, marketplaceId });
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }

  @Post(':id/convert')
  convert(@Param('id') id: string) {
    return this.service.convertToProduct(id);
  }
}
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ScrapedProductQueryDto } from './dto/scraped-product-query.dto';
import { ScrapedProductsService } from './scraped-products.service';

@Controller('scraped-products')
export class ScrapedProductsController {
  constructor(private readonly scrapedProductsService: ScrapedProductsService) {}

  @Get()
  list(@Query() query: ScrapedProductQueryDto) {
    return this.scrapedProductsService.list(query);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.scrapedProductsService.setStatus(id, 'APPROVED');
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.scrapedProductsService.setStatus(id, 'REJECTED');
  }

  @Post(':id/convert')
  convert(@Param('id') id: string) {
    return this.scrapedProductsService.convertToProduct(id);
  }

  @Post(':id/merge')
  merge(@Param('id') id: string, @Body() body: { productId: string }) {
    return this.scrapedProductsService.mergeToProduct(id, body.productId);
  }
}