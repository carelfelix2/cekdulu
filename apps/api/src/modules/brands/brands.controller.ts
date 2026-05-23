import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  list(): Promise<any> {
    return this.brandsService.list();
  }

  @Post()
  create(@Body() body: { slug: string; name: string; logoUrl?: string; description?: string }): Promise<any> {
    return this.brandsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; logoUrl?: string; description?: string }>): Promise<any> {
    return this.brandsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.brandsService.remove(id);
  }
}
