import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { ProductImportService } from './product-import.service';

@Controller('product-import')
export class ProductImportController {
  constructor(private readonly service: ProductImportService) {}

  @Post('fetch')
  async fetch(@Body() body: { url?: string }) {
    if (!body?.url) throw new BadRequestException('Missing url');
    return this.service.fetchProduct(body.url);
  }

  @Post('save')
  async save(@Body() body: { productData?: any; createdBy?: string }) {
    if (!body?.productData) throw new BadRequestException('Missing productData');
    return this.service.saveProduct(body.productData, body.createdBy ?? null);
  }

  @Get('history')
  async history(@Query('limit') limit = '50') {
    return this.service.history({ limit: Number(limit) });
  }
}
