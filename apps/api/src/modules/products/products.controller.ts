import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.productsService.list(Number(page), Number(limit));
  }

  @Get('trending')
  trending() {
    return this.productsService.trending();
  }

  @Get('autocomplete')
  autocomplete(@Query('q') q = '') {
    return this.productsService.autocomplete(q);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.productsService.detail(slug);
  }

  @Get(':slug/compare')
  compare(@Param('slug') slug: string) {
    return this.productsService.compare(slug);
  }

  @Get(':slug/history')
  history(@Param('slug') slug: string) {
    return this.productsService.priceHistory(slug);
  }
}
