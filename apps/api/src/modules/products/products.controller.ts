import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query('page') page = '1', @Query('limit') limit = '20'): Promise<any> {
    return this.productsService.list(Number(page), Number(limit));
  }

  @Get('trending')
  trending(): Promise<any> {
    return this.productsService.trending();
  }

  @Get('autocomplete')
  autocomplete(@Query('q') q = ''): Promise<any> {
    return this.productsService.autocomplete(q);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string): Promise<any> {
    return this.productsService.detail(slug);
  }

  @Get(':slug/compare')
  compare(@Param('slug') slug: string): Promise<any> {
    return this.productsService.compare(slug);
  }

  @Get(':slug/history')
  history(@Param('slug') slug: string): Promise<any> {
    return this.productsService.priceHistory(slug);
  }
}
