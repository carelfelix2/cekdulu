import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('q') q = '',
    @Query('categoryId') categoryId?: string,
    @Query('marketplaceId') marketplaceId?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    return this.productsService.list({ page: Number(page), limit: Number(limit), q, categoryId, marketplaceId, status });
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

  @Post()
  create(@Body() dto: CreateProductDto): Promise<any> {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<any> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.productsService.remove(id);
  }

  @Patch(':id/featured')
  setFeatured(@Param('id') id: string, @Body() body: { isFeatured: boolean }): Promise<any> {
    return this.productsService.setFeatured(id, body.isFeatured);
  }

  @Patch(':id/trending')
  setTrending(@Param('id') id: string, @Body() body: { isTrending: boolean }): Promise<any> {
    return this.productsService.setTrending(id, body.isTrending);
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() body: { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'MERGED' }): Promise<any> {
    return this.productsService.setStatus(id, body.status);
  }
}
