import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import { ProductPricesService } from './product-prices.service';

@Controller('product-prices')
export class ProductPricesController {
  constructor(private readonly productPricesService: ProductPricesService) {}

  @Get()
  list(@Query('productId') productId?: string, @Query('marketplaceId') marketplaceId?: string) {
    return this.productPricesService.list({ productId, marketplaceId });
  }

  @Get('cheapest/:productId')
  cheapest(@Param('productId') productId: string) {
    return this.productPricesService.cheapest(productId);
  }

  @Post()
  create(@Body() dto: CreateProductPriceDto) {
    return this.productPricesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductPriceDto) {
    return this.productPricesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productPricesService.remove(id);
  }
}